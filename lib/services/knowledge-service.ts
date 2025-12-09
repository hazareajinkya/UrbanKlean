import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import qdClient from "../clients/qdrant-client";
import {
  generateDefaultPdfKnowledge,
  generateDefaultTeachKnowledge,
  generateDefaultTextKnowledge,
  generateDefaultWebKnowledge,
  IPdfKnowledge,
  ITeachKnowledge,
  ITextKnowledge,
  IWebKnowledge,
  IWebPropsMetadata,
} from "../types/knowledge";
import embeddingService from "./embedding-service";
import folderService from "./folder-service";
import { db } from "../clients/firebase";
import { v4 } from "uuid";
import { embeddingConfig } from "../constants";
import { chunkPdfContent, chunkText } from "./chunker-service";
import storageService from "./storage-service";
import axiosClient from "../clients/axios-client";
class KnowledgeService {
  async scrapeWebsite(wid: string, url: string) {
    let endpoint = `/api/embeddings/${wid}/web/get-urls?url=${encodeURIComponent(
      url
    )}`;
    const response = await axiosClient.get(endpoint);
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

  async s_embedText(
    wid: string,
    folderId: string,
    textId: string,
    text: string
  ) {
    await this.checkCollection(wid);
    await this.ensureIndexes(wid);

    const textKnowledge = await this.getTextKnowledge(wid, folderId, textId);
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
          folderId,
          textId,
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
  async s_embedTeachContent(
    wid: string,
    folderId: string,
    teachId: string,
    content: string
  ) {
    await this.checkCollection(wid);
    await this.ensureIndexes(wid);
    const chunks = await chunkText(content);
    const chunkTexts = chunks.map((chunk) => chunk.pageContent);
    const embeddings = await embeddingService.createEmbeddingMany(chunkTexts);
    const points = embeddings.map((embedding) => {
      return {
        id: v4(),
        vector: embedding.embedding,
        payload: {
          text: embedding.text,
          source: "teach",
          folderId,
          teachId,
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

  async s_embedPdfs(
    wid: string,
    folderId: string,
    documentId: string,
    pdf: File
  ) {
    await this.checkCollection(wid);
    await this.ensureIndexes(wid);

    // Get the file buffer
    const arrayBuffer = await pdf.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("PDF file is empty");
    }

    const buffer = Buffer.from(arrayBuffer);
    console.log(`Processing PDF: ${pdf.name}, size: ${buffer.length} bytes`);

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
          folderId,
          documentId,
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

  async s_deletePdfKnowledge(wid: string, folderId: string, did: string) {
    const pdfKnowledge = await this.getPdfKnowledge(wid, folderId, did);
    if (!pdfKnowledge) return;

    // Delete from Qdrant vector database
    if (pdfKnowledge.points.length > 0)
      await qdClient.delete(wid, { points: pdfKnowledge.points });

    // Delete file from Firebase Storage
    if (pdfKnowledge.docUrl) {
      try {
        await storageService.deleteFile(pdfKnowledge.docUrl);
      } catch (error) {
        console.log("error: ", error);
      }
    }

    // Delete from Firestore
    await deleteDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/documents/${did}`)
    );
    await folderService.updateFolderItemCount(wid, folderId, "documents", -1);
  }

  async s_deleteWebKnowledge(wid: string, folderId: string, uid: string) {
    try {
      const webKnowledge = await this.getUrlKnowledge(wid, folderId, uid);
      if (!webKnowledge) return;

      if (webKnowledge.points.length > 0)
        await qdClient.delete(wid, { points: webKnowledge.points });

      await deleteDoc(
        doc(db, `workspaces/${wid}/folders/${folderId}/websites/${uid}`)
      );
      await folderService.updateFolderItemCount(wid, folderId, "websites", -1);
    } catch (error: any) {
      console.log("error: ", error);
      console.log("error.data: ", error.data);
    }
  }

  async s_deleteTextKnowledge(wid: string, folderId: string, textId: string) {
    try {
      const textKnowledge = await this.getTextKnowledge(wid, folderId, textId);
      if (!textKnowledge) return;

      // Delete from Qdrant vector database
      if (textKnowledge.points.length > 0)
        await qdClient.delete(wid, { points: textKnowledge.points });

      // Delete from Firestore
      await deleteDoc(
        doc(db, `workspaces/${wid}/folders/${folderId}/texts/${textId}`)
      );
      await folderService.updateFolderItemCount(wid, folderId, "texts", -1);
    } catch (error: any) {
      console.log("error: ", error);
      console.log("error.data: ", error.data);
    }
  }

  async s_deleteTeachKnowledge(wid: string, folderId: string, teachId: string) {
    try {
      const teachKnowledge = await this.getTeachKnowledge(
        wid,
        folderId,
        teachId
      );
      if (!teachKnowledge) return;

      // Delete from Qdrant vector database
      if (teachKnowledge.points.length > 0)
        await qdClient.delete(wid, { points: teachKnowledge.points });

      // Delete from Firestore
      await deleteDoc(
        doc(db, `workspaces/${wid}/folders/${folderId}/teach/${teachId}`)
      );
      await folderService.updateFolderItemCount(wid, folderId, "teach", -1);
    } catch (error: any) {
      console.log("error: ", error);
      console.log("error.data: ", error.data);
    }
  }

  async deleteAllTextKnowledge(wid: string) {
    try {
      const foldersRef = collection(db, `workspaces/${wid}/folders`);
      const foldersSnap = await getDocs(foldersRef);

      for (const folderDoc of foldersSnap.docs) {
        const folderId = folderDoc.id;
        const textsRef = collection(
          db,
          `workspaces/${wid}/folders/${folderId}/texts`
        );
        const textsSnap = await getDocs(textsRef);

        for (const textDoc of textsSnap.docs) {
          await this.s_deleteTextKnowledge(wid, folderId, textDoc.id);
        }
      }
    } catch (error: any) {
      console.error("Error deleting all text knowledge:", error);
    }
  }

  async deleteAllTeachKnowledge(wid: string) {
    try {
      const foldersRef = collection(db, `workspaces/${wid}/folders`);
      const foldersSnap = await getDocs(foldersRef);

      for (const folderDoc of foldersSnap.docs) {
        const folderId = folderDoc.id;
        const teachRef = collection(
          db,
          `workspaces/${wid}/folders/${folderId}/teach`
        );
        const teachSnap = await getDocs(teachRef);

        for (const teachDoc of teachSnap.docs) {
          await this.s_deleteTeachKnowledge(wid, folderId, teachDoc.id);
        }
      }
    } catch (error: any) {
      console.error("Error deleting all teach knowledge:", error);
    }
  }

  async deleteAllPdfKnowledge(wid: string) {
    try {
      const foldersRef = collection(db, `workspaces/${wid}/folders`);
      const foldersSnap = await getDocs(foldersRef);

      for (const folderDoc of foldersSnap.docs) {
        const folderId = folderDoc.id;
        const docsRef = collection(
          db,
          `workspaces/${wid}/folders/${folderId}/documents`
        );
        const docsSnap = await getDocs(docsRef);

        for (const pdfDoc of docsSnap.docs) {
          await this.s_deletePdfKnowledge(wid, folderId, pdfDoc.id);
        }
      }
    } catch (error: any) {
      console.error("Error deleting all pdf knowledge:", error);
    }
  }

  async deleteAllWebKnowledge(wid: string) {
    try {
      const foldersRef = collection(db, `workspaces/${wid}/folders`);
      const foldersSnap = await getDocs(foldersRef);

      for (const folderDoc of foldersSnap.docs) {
        const folderId = folderDoc.id;
        const websitesRef = collection(
          db,
          `workspaces/${wid}/folders/${folderId}/websites`
        );
        const websitesSnap = await getDocs(websitesRef);

        for (const webDoc of websitesSnap.docs) {
          await this.s_deleteWebKnowledge(wid, folderId, webDoc.id);
        }
      }
    } catch (error: any) {
      console.error("Error deleting all web knowledge:", error);
    }
  }

  async s_savePDFKnowledge(
    wid: string,
    folderId: string,
    pdf: File,
    points: string[],
    chunkSize: number
  ) {
    const result = generateDefaultPdfKnowledge(
      wid,
      folderId,
      points,
      chunkSize
    );
    const storageRef = `workspaces/${wid}/folders/${folderId}/documents/${result.id}-${pdf.name}`;

    //upload to db
    const data = await storageService.uploadFile(pdf, storageRef, pdf.name);

    result.docName = pdf.name;
    result.docUrl = data.downloadURL;
    result.metadata = data.metadata;

    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/documents/${result.id}`),
      result
    );
    await folderService.updateFolderItemCount(wid, folderId, "documents", 1);
  }

  async s_embedWeb(
    wid: string,
    folderId: string,
    websiteId: string,
    content: string,
    metadata: IWebPropsMetadata
  ) {
    try {
      await this.checkCollection(wid);
      await this.ensureIndexes(wid);
      if (!metadata) throw new Error("Metadata is required");
      const webKnowledge = await this.getUrlKnowledge(wid, folderId, websiteId);
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
            folderId,
            websiteId,
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

  async s_startedCrawl(
    wid: string,
    folderId: string,
    baseUrl: string,
    title: string
  ) {
    const id = v4();
    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/websites/${id}`),
      {
        id,
        wid,
        folderId,
        title,
        baseUrl,
        urls: [],
        points: [],
        status: "training",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    await folderService.updateFolderItemCount(wid, folderId, "websites", 1);
    return id;
  }

  async s_compeletedTraining(wid: string, folderId: string, docId: string) {
    const websitesRef = collection(
      db,
      `workspaces/${wid}/folders/${folderId}/websites`
    );
    const snaps = await getDocs(websitesRef);

    const updatePromises = snaps.docs.map((docSnap) =>
      updateDoc(docSnap.ref, {
        status: "trained",
        updatedAt: new Date().toISOString(),
      })
    );

    await Promise.all(updatePromises);
  }
  async s_saveSingleUrlKnowledge(
    wid: string,
    folderId: string,
    metadata: IWebPropsMetadata,
    points: string[],
    chunkSize: number
  ) {
    const data = generateDefaultWebKnowledge(
      v4(),
      wid,
      folderId,
      metadata.title,
      metadata.url,
      [metadata],
      chunkSize,
      points
    );

    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/websites/${data.id}`),
      data,
      { merge: true }
    );
    await folderService.updateFolderItemCount(wid, folderId, "websites", 1);
    return data;
  }

  async s_saveScrapedWebPage(
    wid: string,
    folderId: string,
    docId: string,
    metadata: IWebPropsMetadata,
    points: string[],
    chunkSize: number
  ) {
    const data = generateDefaultWebKnowledge(
      docId,
      wid,
      folderId,
      metadata.title,
      metadata.url,
      [metadata],
      chunkSize,
      points
    );

    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/websites/${data.id}`),
      data,
      { merge: true }
    );
    await folderService.updateFolderItemCount(wid, folderId, "websites", 1);
    return data;
  }

  async s_saveMultiUrlKnowledge(
    wid: string,
    folderId: string,
    docId: string,
    metadata: IWebPropsMetadata,
    points: string[],
    chunkSize: number
  ) {
    await updateDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/websites/${docId}`),
      {
        urls: arrayUnion(metadata),
        chunkSize: increment(chunkSize),
        points: arrayUnion(...points),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  async s_saveText(
    wid: string,
    folderId: string,
    points: string[],
    content: string,
    chunkSize: number
  ) {
    const data = generateDefaultTextKnowledge(
      wid,
      folderId,
      points,
      content,
      chunkSize
    );

    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/texts/${data.id}`),
      data
    );
    await folderService.updateFolderItemCount(wid, folderId, "texts", 1);
  }

  async s_saveTeachKnowledge(
    wid: string,
    folderId: string,
    teachId: string,
    title: string,
    content: string,
    points: string[],
    chunkSize: number
  ) {
    const data = generateDefaultTeachKnowledge(
      wid,
      folderId,
      points,
      title,
      content,
      chunkSize,
      teachId
    );
    console.log("teach data: ", data);
    const ref = doc(
      db,
      `workspaces/${wid}/folders/${folderId}/teach/${data.id}`
    );
    await setDoc(ref, data);
    await folderService.updateFolderItemCount(wid, folderId, "teach", 1);
  }

  async getTextKnowledge(
    wid: string,
    folderId: string,
    textId: string
  ): Promise<ITextKnowledge | null> {
    const snap = await getDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/texts/${textId}`)
    );
    if (!snap.exists()) return null;
    return snap.data() as ITextKnowledge;
  }

  async getAllTextKnowledge(
    wid: string,
    folderId: string
  ): Promise<ITextKnowledge[]> {
    const colRef = collection(
      db,
      `workspaces/${wid}/folders/${folderId}/texts`
    );
    const q = query(colRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as ITextKnowledge);
  }

  async getTeachKnowledge(
    wid: string,
    folderId: string,
    tid: string
  ): Promise<ITeachKnowledge | null> {
    const ref = doc(db, `workspaces/${wid}/folders/${folderId}/teach/${tid}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as ITeachKnowledge;
  }

  async getAllTeachKnowledge(
    wid: string,
    folderId: string
  ): Promise<ITeachKnowledge[]> {
    const colRef = collection(
      db,
      `workspaces/${wid}/folders/${folderId}/teach`
    );
    const q = query(colRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as ITeachKnowledge);
  }

  async getAllTeachKnowledgeAcrossFolders(wid: string) {
    // First, get all folders
    const foldersRef = collection(db, `workspaces/${wid}/folders`);
    const foldersSnap = await getDocs(foldersRef);

    // Then fetch teach knowledge from each folder
    const allTeachKnowledge: ITeachKnowledge[] = [];
    for (const folderDoc of foldersSnap.docs) {
      const folderId = folderDoc.id;
      const teachRef = collection(
        db,
        `workspaces/${wid}/folders/${folderId}/teach`
      );
      const teachSnap = await getDocs(
        query(teachRef, orderBy("updatedAt", "desc"))
      );
      const teachData = teachSnap.docs.map(
        (doc) => doc.data() as ITeachKnowledge
      );
      allTeachKnowledge.push(...teachData);
    }
    return allTeachKnowledge.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getPdfKnowledge(
    wid: string,
    folderId: string,
    documentId: string
  ): Promise<IPdfKnowledge["files"][number] | null> {
    const snap = await getDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/documents/${documentId}`)
    );
    if (!snap.exists()) return null;
    return snap.data() as IPdfKnowledge["files"][number];
  }

  async getAllPdfKnowledge(
    wid: string,
    folderId: string
  ): Promise<IPdfKnowledge["files"][number][]> {
    const colRef = collection(
      db,
      `workspaces/${wid}/folders/${folderId}/documents`
    );
    const q = query(colRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as IPdfKnowledge["files"][number]);
  }

  async getWebKnowledge(
    wid: string,
    folderId: string
  ): Promise<IWebKnowledge[]> {
    const snaps = await getDocs(
      query(collection(db, `workspaces/${wid}/folders/${folderId}/websites`))
    );
    return snaps.docs.map((doc) => doc.data() as IWebKnowledge);
  }

  async getUrlKnowledge(
    wid: string,
    folderId: string,
    id: string
  ): Promise<IWebKnowledge | null> {
    const snap = await getDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/websites/${id}`)
    );
    if (!snap.exists()) return null;
    return snap.data() as IWebKnowledge;
  }

  async getUrlKnowledgeByUrl(
    wid: string,
    folderId: string,
    url: string
  ): Promise<IWebKnowledge | null> {
    const snaps = await getDocs(
      query(
        collection(db, `workspaces/${wid}/folders/${folderId}/websites`),
        where("baseUrl", "==", url)
      )
    );
    if (snaps.empty) return null;
    return snaps.docs[0].data() as IWebKnowledge;
  }
  async ensureIndexes(wid: string) {
    await qdClient.createPayloadIndex(wid, {
      field_name: "folderId",
      field_schema: "keyword",
    });
  }
}

const knowledgeService = new KnowledgeService();
export default knowledgeService;
