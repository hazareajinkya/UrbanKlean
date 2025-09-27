import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import qdClient from "../clients/qdrant-client";
import {
  generateDefaultPdfKnowledge,
  generateDefaultTextKnowledge,
  generateDefaultWebKnowledge,
  IPdfKnowledge,
  ITextKnowledge,
  IWebKnowledge,
  IWebPropsMetadata,
} from "../types/knowledge";
import embeddingService from "./embedding-service";
import { db } from "../clients/firebase";
import { v4 } from "uuid";
import { embeddingConfig } from "../constants";
import { chunkPdfContent, chunkText } from "./chunker-service";
import storageService from "./storage-service";
import { DocumentMetadata } from "@mendable/firecrawl-js";
import axiosClient from "../clients/axios-client";

class KnowledgeService {
  async scrapeWebsite(wid: string, url: string) {
    const response = await axiosClient.get(
      `/api/embeddings/${wid}/web/get-urls?url=${encodeURIComponent(url)}`
    );
    return response.data.data.result;
  }

  async checkCollection(wid: string) {
    try {
      const result = await qdClient.collectionExists(wid);

      if (result.exists) return;
      await qdClient.createCollection(wid, {
        vectors: {
          size: embeddingConfig.dimension,
          distance: embeddingConfig.distance,
        },
      });
      console.log("collection created: ");
    } catch (error: any) {
      console.error("Error checking collection: ", error);
      throw error;
    }
  }

  async embedText(wid: string, text: string) {
    await this.checkCollection(wid);

    const textKnowledge = await knowledgeService.getTextKnowledge(wid);
    const chunks = await chunkText(text);
    const chunkTexts = chunks.map((chunk) => chunk.pageContent);
    const embeddings = await embeddingService.createEmbeddingMany(chunkTexts);

    if (textKnowledge)
      await qdClient.delete(wid, { points: textKnowledge.points });
    const points = embeddings.map((embedding) => {
      return {
        id: v4(),
        vector: embedding.embedding,
        payload: {
          text: embedding.text,
          source: "text",
        },
      };
    });

    await qdClient.upsert(wid, { points: points });
    return {
      chunks: embeddings,
      points: points.map((point) => point.id),
      chunkSize: embeddings.length,
    };
  }

  async embedPdfs(wid: string, pdf: File) {
    const buffer = Buffer.from(await pdf.arrayBuffer());
    const chunks = await chunkPdfContent(buffer);
    const chunkTexts = chunks.map((chunk) => chunk.pageContent);
    const embeddings = await embeddingService.createEmbeddingMany(chunkTexts);

    const points = embeddings.map((embedding) => {
      return {
        id: v4(),
        vector: embedding.embedding,
        payload: {
          text: embedding.text,
          name: pdf.name,
          source: "pdf",
        },
      };
    });

    await qdClient.upsert(wid, { points: points });

    return {
      chunks: embeddings,
      points: points.map((point) => point.id),
      chunkSize: embeddings.length,
    };
  }

  async deletePdfKnowledge(wid: string, did: string) {
    const pdfKnowledge = await this.getPdfKnowledge(wid);
    if (!pdfKnowledge?.files) return;

    const fileToDelete = pdfKnowledge.files.find((file) => file.id === did);
    if (!fileToDelete) return;

    // Delete from Qdrant vector database
    await qdClient.delete(wid, { points: fileToDelete.points });
    console.log("fileToDelete: ", fileToDelete);

    // Delete file from Firebase Storage
    if (fileToDelete.docUrl) {
      console.log("fileToDelete.docUrl: ", fileToDelete.docUrl);

      try {
        await storageService.deleteFile(fileToDelete.docUrl);
      } catch (error) {
        console.log("error: ", error);
      }
    }

    // Remove from Firestore document
    const updatedFiles = pdfKnowledge.files.filter((file) => file.id !== did);

    if (updatedFiles.length === 0) {
      // Delete the entire document if no files left
      await deleteDoc(doc(db, `workspaces/${wid}/knowledge/pdfs`));
    } else {
      // Update with remaining files
      await setDoc(
        doc(db, `workspaces/${wid}/knowledge/pdfs`),
        { files: updatedFiles },
        { merge: false }
      );
    }
  }

  async deleteWebKnowledge(wid: string, uid: string) {
    try {
      const webKnowledge = await this.getUrlKnowledge(wid, uid);
      if (!webKnowledge) return;

      if (webKnowledge.points.length > 0)
        await qdClient.delete(wid, { points: webKnowledge.points });

      await deleteDoc(
        doc(db, `workspaces/${wid}/knowledge/web/default/${uid}`)
      );
    } catch (error: any) {
      console.log("error: ", error);
      console.log("error.data: ", error.data);
    }
  }

  async savePDFKnowledge(
    wid: string,
    pdf: File,
    points: string[],
    chunkSize: number
  ) {
    const result = generateDefaultPdfKnowledge(wid, points, chunkSize);
    const storageRef = `workspaces/${wid}/knowledge/${result.id}-${pdf.name}`;

    //upload to db
    const data = await storageService.uploadFile(pdf, storageRef, pdf.name);

    result.docName = pdf.name;
    result.docUrl = data.downloadURL;
    result.metadata = data.metadata;

    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/pdfs`),
      { files: arrayUnion(result) },
      {
        merge: true,
      }
    );
  }

  async embedWeb(wid: string, content: string, metadata: IWebPropsMetadata) {
    try {
      await this.checkCollection(wid);
      if (!metadata) throw new Error("Metadata is required");
      const webKnowledge = await knowledgeService.getUrlKnowledgeByUrl(
        wid,
        metadata.url as string
      );
      const chunks = await chunkText(content);
      const chunkTexts = chunks.map((chunk) => chunk.pageContent);
      const embeddings = await embeddingService.createEmbeddingMany(chunkTexts);

      if (webKnowledge)
        await qdClient.delete(wid, { points: webKnowledge.points });

      const points = embeddings.map((embedding) => {
        return {
          id: v4(),
          vector: embedding.embedding,
          payload: {
            text: embedding.text,
            title: metadata.title,
            url: metadata.url,
            source: "web",
          },
        };
      });

      await qdClient.upsert(wid, { points: points });
      return {
        chunks: embeddings,
        points: points.map((point) => point.id),
        chunkSize: embeddings.length,
      };
    } catch (error: any) {
      console.log("error: ", error);
      console.log("error.data: ", error?.data);
      return { chunks: [], points: [], chunkSize: 0 };
    }
  }

  async startedCrawl(wid: string, baseUrl: string, title: string) {
    const id = v4();
    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/web/default/${id}`),
      {
        id,
        wid,
        title,
        baseUrl,
        urls: [],
        points: [],
        status: "training",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return id;
  }

  async compeletedTraining(wid: string, docId: string) {
    await updateDoc(
      doc(db, `workspaces/${wid}/knowledge/web/default/${docId}`),
      {
        status: "trained",
        updatedAt: new Date().toISOString(),
      }
    );
  }
  async saveSingleUrlKnowledge(
    wid: string,
    metadata: IWebPropsMetadata,
    points: string[],
    chunkSize: number
  ) {
    const data = generateDefaultWebKnowledge(
      v4(),
      wid,
      metadata.title,
      metadata.url,
      [metadata],
      chunkSize,
      points
    );

    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/web/default/${data.id}`),
      data,
      { merge: true }
    );
    return data;
  }

  async saveMultiUrlKnowledge(
    wid: string,
    docId: string,
    metadata: IWebPropsMetadata,
    points: string[],
    chunkSize: number
  ) {
    await updateDoc(
      doc(db, `workspaces/${wid}/knowledge/web/default/${docId}`),
      {
        urls: arrayUnion(metadata),
        chunkSize: increment(chunkSize),
        points: arrayUnion(...points),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  async saveText(
    wid: string,
    points: string[],
    content: string,
    chunkSize: number
  ) {
    const data = generateDefaultTextKnowledge(wid, points, content, chunkSize);

    await setDoc(doc(db, `workspaces/${wid}/knowledge/text`), data, {
      merge: true,
    });
  }

  async getTextKnowledge(wid: string) {
    const snap = await getDoc(doc(db, `workspaces/${wid}/knowledge/text`));
    const data = snap.data() as ITextKnowledge;
    return data ?? null;
  }

  async getPdfKnowledge(wid: string) {
    const snap = await getDoc(doc(db, `workspaces/${wid}/knowledge/pdfs`));
    const data = snap.data() as IPdfKnowledge;
    return data ?? null;
  }

  async getWebKnowledge(wid: string) {
    const snaps = await getDocs(
      query(collection(db, `workspaces/${wid}/knowledge/web/default`))
    );
    const data = snaps.docs.map((doc) => doc.data() as IWebKnowledge);
    return data ?? [];
  }

  async getUrlKnowledge(wid: string, id: string) {
    const snap = await getDoc(
      doc(db, `workspaces/${wid}/knowledge/web/default/${id}`)
    );
    const data = snap.data() as IWebKnowledge;
    return data;
  }

  async getUrlKnowledgeByUrl(wid: string, url: string) {
    const snaps = await getDocs(
      query(
        collection(db, `workspaces/${wid}/knowledge/web/default`),
        where("baseUrl", "==", url)
      )
    );
    const data = snaps.docs.map((doc) => doc.data() as IWebKnowledge)[0];
    return data;
  }
}

const knowledgeService = new KnowledgeService();
export default knowledgeService;
