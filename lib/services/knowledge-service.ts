import { doc, getDoc, setDoc } from "firebase/firestore";
import qdClient from "../clients/qdrant-client";
import {
  generateDefaultTextKnowledge,
  ITextKnowledge,
} from "../types/knowledge";
import chunkerService from "./chunker-service";
import embeddingService from "./embedding-service";
import { db } from "../clients/firebase";
import { v4 } from "uuid";

class KnowledgeService {
  async checkCollection(wid: string) {
    try {
      const result = await qdClient.collectionExists(wid);

      if (result.exists) return;
      await qdClient.createCollection(wid, {
        vectors: {
          size: 3072,
          distance: "Cosine",
        },
      });
      console.log("collection created: ");
    } catch (error: any) {
      console.error("Error checking collection: ", error);
      throw error;
    }
  }

  async embedText(wid: string, tid: string, text: string) {
    await this.checkCollection(wid);

    const textKnowledge = await knowledgeService.getTextKnowledge(wid);
    const chunks = await chunkerService.chunkText(text);
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
}

const knowledgeService = new KnowledgeService();
export default knowledgeService;
