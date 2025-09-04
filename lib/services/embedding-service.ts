import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { embeddingModel } from "../constants";

class EmbeddingService {
  async createEmbeddingMany(texts: string[]) {
    const embeddings = await embedMany({
      // model: openai.embedding(embeddingModel),
      model: google.textEmbedding("gemini-embedding-001"),
      values: texts,
    });

    return embeddings.embeddings.map((embedding, index) => ({
      text: texts[index],
      embedding: embedding,
    }));
  }

  async createEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: google.textEmbedding("gemini-embedding-001"),
      value: text,
    });

    return embedding;
  }
}

const embeddingService = new EmbeddingService();
export default embeddingService;
