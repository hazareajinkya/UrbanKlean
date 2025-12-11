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
  limit,
  collectionGroup,
  writeBatch,
  WriteBatch,
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
    const endpoint = `/api/embeddings/${wid}/web/get-urls?url=${encodeURIComponent(
      url
    )}`;
    const response = await axiosClient.get(endpoint);
    return response.data.data.result;
  }

  async checkCollection(wid: string) {
    try {
      const result = await qdClient.collectionExists(wid);

      if (result.exists) {
        return;
      }
      await qdClient.createCollection(wid, {
        vectors: {
          size: embeddingConfig.dimension,
          distance: embeddingConfig.distance,
        },
      });
    } catch (error: unknown) {
      console.error("Error checking collection: ", error);
      throw error;
    }
  }

  async ensureIndexes(wid: string) {
    await qdClient.createPayloadIndex(wid, {
      field_name: "folderId",
      field_schema: "keyword",
    });
  }

  // EMBED Method
  async s_embedText(
    wid: string,
    folderId: string,
    textId: string,
    text: string,
    title: string
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
          title,
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

    const arrayBuffer = await pdf.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("PDF file is empty");
    }

    const buffer = Buffer.from(arrayBuffer);

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

      if (webKnowledge && webKnowledge.points && webKnowledge.points.length > 0)
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
    } catch (error: unknown) {
      console.log("error: ", error);
      if (error && typeof error === "object" && "data" in error) {
        console.log("error.data: ", (error as { data: unknown }).data);
      }
      return { chunks: [], points: [], chunkSize: 0 };
    }
  }

  // SAVE Method
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
    const data = await storageService.uploadFile(pdf, storageRef, pdf.name);
    result.docName = pdf.name;
    result.docUrl = data.downloadURL;
    result.metadata = data.metadata;

    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/documents/${result.id}`),
      result
    );
  }

  async s_saveText(
    wid: string,
    folderId: string,
    points: string[],
    content: string,
    chunkSize: number,
    title: string
  ) {
    const data = generateDefaultTextKnowledge(
      wid,
      folderId,
      title,
      points,
      content,
      chunkSize
    );
    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/texts/${data.id}`),
      data
    );
  }

  async s_updateTextKnowledge(
    wid: string,
    folderId: string,
    textId: string,
    title: string,
    content: string,
    points: string[],
    chunkSize: number
  ) {
    const data = generateDefaultTextKnowledge(
      wid,
      folderId,
      title,
      points,
      content,
      chunkSize,
      textId
    );
    await setDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/texts/${textId}`),
      data,
      { merge: true }
    );
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
    return id;
  }

  async s_completedTraining(wid: string, folderId: string, docId: string) {
    if (!docId) return;
    const ref = doc(
      db,
      `workspaces/${wid}/folders/${folderId}/websites/${docId}`
    );
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    await updateDoc(ref, {
      status: "trained",
      updatedAt: new Date().toISOString(),
    });
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
    return data;
  }

  async s_createPendingWebKnowledge(
    wid: string,
    folderId: string,
    url: string,
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
        baseUrl: url,
        urls: [],
        points: [],
        status: "training",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return id;
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

  // DELETE Method

  async s_deletePdfKnowledge(wid: string, folderId: string, did: string) {
    const pdfKnowledge = await this.getPdfKnowledge(wid, folderId, did);
    if (!pdfKnowledge) return;

    if (pdfKnowledge.points.length > 0)
      await qdClient.delete(wid, { points: pdfKnowledge.points });

    if (pdfKnowledge.docUrl) {
      try {
        await storageService.deleteFile(pdfKnowledge.docUrl);
      } catch (error) {
        console.log("error: ", error);
      }
    }
    await deleteDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/documents/${did}`)
    );
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
    } catch (error: unknown) {
      console.log("error: ", error);
    }
  }

  async s_deleteTextKnowledge(wid: string, folderId: string, textId: string) {
    try {
      const textKnowledge = await this.getTextKnowledge(wid, folderId, textId);
      if (!textKnowledge) return;

      if (textKnowledge.points.length > 0)
        await qdClient.delete(wid, { points: textKnowledge.points });
      await deleteDoc(
        doc(db, `workspaces/${wid}/folders/${folderId}/texts/${textId}`)
      );
    } catch (error: unknown) {
      console.log("error: ", error);
      if (error && typeof error === "object" && "data" in error) {
        console.log("error.data: ", (error as { data: unknown }).data);
      }
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
      if (teachKnowledge.points.length > 0)
        await qdClient.delete(wid, { points: teachKnowledge.points });
      await deleteDoc(
        doc(db, `workspaces/${wid}/folders/${folderId}/teach/${teachId}`)
      );
    } catch (error: unknown) {
      console.log("error: ", error);
      if (error && typeof error === "object" && "data" in error) {
        console.log("error.data: ", (error as { data: unknown }).data);
      }
    }
  }

  async deleteAllTextKnowledge(wid: string) {
    try {
      const textsQuery = query(
        collectionGroup(db, "texts"),
        where("wid", "==", wid)
      );
      const textsSnap = await getDocs(textsQuery);

      if (textsSnap.empty) return;

      const batchSize = 500;
      const batches: WriteBatch[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;
      const allPoints: string[] = [];

      for (const doc of textsSnap.docs) {
        // Collect points for Qdrant deletion
        const data = doc.data() as ITextKnowledge;
        if (data.points && data.points.length > 0) {
          allPoints.push(...data.points);
        }

        // Add to batch
        currentBatch.delete(doc.ref);
        count++;

        if (count >= batchSize) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        batches.push(currentBatch);
      }

      // Execute Qdrant deletion
      if (allPoints.length > 0) {
        // Chunk points if necessary for qdrant (optional, but safe)
        const pointChunks = [];
        for (let i = 0; i < allPoints.length; i += 1000) {
          pointChunks.push(allPoints.slice(i, i + 1000));
        }
        await Promise.all(
          pointChunks.map((points) => qdClient.delete(wid, { points }))
        );
      }

      // Execute Firestore batches
      await Promise.all(batches.map((batch) => batch.commit()));
    } catch (error: unknown) {
      console.error("Error deleting all text knowledge:", error);
    }
  }

  async deleteAllTeachKnowledge(wid: string) {
    try {
      const teachQuery = query(
        collectionGroup(db, "teach"),
        where("wid", "==", wid)
      );
      const teachSnap = await getDocs(teachQuery);

      if (teachSnap.empty) return;

      const batchSize = 500;
      const batches: WriteBatch[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;
      const allPoints: string[] = [];

      for (const doc of teachSnap.docs) {
        const data = doc.data() as ITeachKnowledge;
        if (data.points && data.points.length > 0) {
          allPoints.push(...data.points);
        }

        currentBatch.delete(doc.ref);
        count++;

        if (count >= batchSize) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) batches.push(currentBatch);

      if (allPoints.length > 0) {
        const pointChunks = [];
        for (let i = 0; i < allPoints.length; i += 1000) {
          pointChunks.push(allPoints.slice(i, i + 1000));
        }
        await Promise.all(
          pointChunks.map((points) => qdClient.delete(wid, { points }))
        );
      }

      await Promise.all(batches.map((batch) => batch.commit()));
    } catch (error: unknown) {
      console.error("Error deleting all teach knowledge:", error);
    }
  }

  async deleteAllPdfKnowledge(wid: string) {
    try {
      const docsQuery = query(
        collectionGroup(db, "documents"),
        where("wid", "==", wid)
      );
      const docsSnap = await getDocs(docsQuery);

      if (docsSnap.empty) return;

      const batchSize = 500;
      const batches: WriteBatch[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;
      const allPoints: string[] = [];
      const storagePromises: Promise<void>[] = [];

      for (const doc of docsSnap.docs) {
        const data = doc.data() as IPdfKnowledge["files"][number];
        if (data.points && data.points.length > 0) {
          allPoints.push(...data.points);
        }

        if (data.docUrl) {
          storagePromises.push(
            storageService
              .deleteFile(data.docUrl)
              .catch((e) => console.error("Storage delete error:", e))
          );
        }

        currentBatch.delete(doc.ref);
        count++;

        if (count >= batchSize) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) batches.push(currentBatch);

      if (allPoints.length > 0) {
        const pointChunks = [];
        for (let i = 0; i < allPoints.length; i += 1000) {
          pointChunks.push(allPoints.slice(i, i + 1000));
        }
        await Promise.all(
          pointChunks.map((points) => qdClient.delete(wid, { points }))
        );
      }

      await Promise.all([
        Promise.all(batches.map((batch) => batch.commit())),
        Promise.all(storagePromises),
      ]);
    } catch (error: unknown) {
      console.error("Error deleting all pdf knowledge:", error);
    }
  }

  async deleteAllWebKnowledge(wid: string) {
    try {
      const webQuery = query(
        collectionGroup(db, "websites"),
        where("wid", "==", wid)
      );
      const webSnap = await getDocs(webQuery);

      if (webSnap.empty) return;

      const batchSize = 500;
      const batches: WriteBatch[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;
      const allPoints: string[] = [];

      for (const doc of webSnap.docs) {
        const data = doc.data() as IWebKnowledge;
        if (data.points && data.points.length > 0) {
          allPoints.push(...data.points);
        }

        currentBatch.delete(doc.ref);
        count++;

        if (count >= batchSize) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) batches.push(currentBatch);

      if (allPoints.length > 0) {
        const pointChunks = [];
        for (let i = 0; i < allPoints.length; i += 1000) {
          pointChunks.push(allPoints.slice(i, i + 1000));
        }
        await Promise.all(
          pointChunks.map((points) => qdClient.delete(wid, { points }))
        );
      }

      await Promise.all(batches.map((batch) => batch.commit()));
    } catch (error: unknown) {
      console.error("Error deleting all web knowledge:", error);
    }
  }

  async deleteAllKnowledgeInFolder(wid: string, folderId: string) {
    try {
      // Check if there is any content in the folder
      const collectionsToCheck = ["documents", "websites", "texts", "teach"];
      const hasContentPromises = collectionsToCheck.map(async (colName) => {
        const colRef = collection(
          db,
          `workspaces/${wid}/folders/${folderId}/${colName}`
        );
        const snap = await getDocs(query(colRef, limit(1)));
        return !snap.empty;
      });

      const results = await Promise.all(hasContentPromises);
      const isFolderEmpty = results.every((hasContent) => !hasContent);

      if (isFolderEmpty) return;

      const { exists } = await qdClient.collectionExists(wid);
      if (!exists) return;

      await qdClient.delete(wid, {
        filter: {
          must: [
            {
              key: "folderId",
              match: { value: folderId },
            },
          ],
        },
      });
    } catch (error: unknown) {
      console.error("Error deleting folder knowledge from Qdrant:", error);
    }
  }

  // GET method

  async getTextKnowledge(wid: string, folderId: string, textId: string) {
    const snap = await getDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/texts/${textId}`)
    );
    if (!snap.exists()) return null;
    return snap.data() as ITextKnowledge;
  }

  async getAllTextKnowledge(wid: string, folderId: string) {
    const colRef = collection(
      db,
      `workspaces/${wid}/folders/${folderId}/texts`
    );
    const q = query(colRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as ITextKnowledge);
  }

  async getTeachKnowledge(wid: string, folderId: string, tid: string) {
    const ref = doc(db, `workspaces/${wid}/folders/${folderId}/teach/${tid}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as ITeachKnowledge;
  }

  async getAllTeachKnowledge(wid: string, folderId: string) {
    const colRef = collection(
      db,
      `workspaces/${wid}/folders/${folderId}/teach`
    );
    const q = query(colRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as ITeachKnowledge);
  }

  async getAllTeachKnowledgeAcrossFolders(wid: string) {
    try {
      const q = query(
        collectionGroup(db, "teach"),
        where("wid", "==", wid),
        orderBy("updatedAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((doc) => doc.data() as ITeachKnowledge);
    } catch (error) {
      console.error("Error getting all teach knowledge across folders:", error);
      return [];
    }
  }

  async getPdfKnowledge(wid: string, folderId: string, documentId: string) {
    const snap = await getDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/documents/${documentId}`)
    );
    if (!snap.exists()) return null;
    return snap.data() as IPdfKnowledge["files"][number];
  }

  async getAllPdfKnowledge(wid: string, folderId: string) {
    const colRef = collection(
      db,
      `workspaces/${wid}/folders/${folderId}/documents`
    );
    const q = query(colRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as IPdfKnowledge["files"][number]);
  }

  async getWebKnowledge(wid: string, folderId: string) {
    const snaps = await getDocs(
      query(collection(db, `workspaces/${wid}/folders/${folderId}/websites`))
    );
    return snaps.docs.map((doc) => doc.data() as IWebKnowledge);
  }

  async getUrlKnowledge(wid: string, folderId: string, id: string) {
    const snap = await getDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/websites/${id}`)
    );
    if (!snap.exists()) return null;
    return snap.data() as IWebKnowledge;
  }

  async getUrlKnowledgeByUrl(wid: string, folderId: string, url: string) {
    const snaps = await getDocs(
      query(
        collection(db, `workspaces/${wid}/folders/${folderId}/websites`),
        where("baseUrl", "==", url)
      )
    );
    if (snaps.empty) return null;
    return snaps.docs[0].data() as IWebKnowledge;
  }
}

const knowledgeService = new KnowledgeService();
export default knowledgeService;
