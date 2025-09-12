import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { embeddingConfig, voyage } from "../constants";

class EmbeddingService {
  async createEmbeddingMany(texts: string[]) {
    const embeddings = await embedMany({
      model: embeddingConfig.model,
      values: texts,
    });

    return embeddings.embeddings.map((embedding, index) => ({
      text: texts[index],
      embedding: embedding,
    }));
  }

  async createEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: embeddingConfig.model,
      value: text,
    });

    return embedding;
  }
}

const embeddingService = new EmbeddingService();
export default embeddingService;
