import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  query,
  setDoc,
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

class KnowledgeService {
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
    const webKnowledge = await this.getWebKnowledge(wid);
    if (!webKnowledge?.urls) return;

    const urlToDelete = webKnowledge.urls.find((url) => url.id === uid);
    if (!urlToDelete) return;

    // Delete from Qdrant vector database
    await qdClient.delete(wid, { points: urlToDelete.points });
    console.log("urlToDelete: ", urlToDelete);

    // Remove from Firestore document
    const updatedUrls = webKnowledge.urls.filter((url) => url.id !== uid);

    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/web`),
      {
        urls: updatedUrls,
        chunkSize: webKnowledge.chunkSize,
        updatedAt: new Date().toISOString(),
      },
      { merge: false }
    );
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
    if (!metadata) throw new Error("Metadata is required");
    const webKnowledge = await knowledgeService.getUrlKnowledge(
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
  }

  async saveWebKnowledge(
    wid: string,
    metadata: IWebPropsMetadata,
    points: string[],
    chunkSize: number
  ) {
    const data = generateDefaultWebKnowledge(
      wid,
      metadata.title,
      metadata.url,
      points
    );

    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/web`),
      {
        chunkSize: chunkSize,
        urls: arrayUnion(data),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
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
    const snap = await getDoc(doc(db, `workspaces/${wid}/knowledge/web`));
    const data = snap.data() as IWebKnowledge;
    return data ?? null;
  }

  async getUrlKnowledge(wid: string, url: string) {
    const snap = await getDoc(doc(db, `workspaces/${wid}/knowledge/web`));
    const data = snap.data() as IWebKnowledge;
    const urlKnowledge = data?.urls.find((item) => item.url === url);
    return urlKnowledge ?? null;
  }
}

const knowledgeService = new KnowledgeService();
export default knowledgeService;
