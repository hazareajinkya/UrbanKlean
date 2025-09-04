import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

class ChunkerService {
  private defaultChunkOptions: ChunkOptions = {
    chunkSize: 1000,
    chunkOverlap: 200,
  };

  /**
   * Split text into chunks
   */
  async chunkText(
    text: string,
    options: ChunkOptions = this.defaultChunkOptions
  ) {
    try {
      const { chunkSize = 1000, chunkOverlap = 200 } = options;

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
      });

      const chunks = await splitter.createDocuments([text]);
      return chunks;
    } catch (error) {
      console.error("Error chunking text:", error);
      throw new Error("Failed to chunk text");
    }
  }

  /**
   * Load and chunk web content
   */
  // async chunkWebContent(
  //   url: string,
  //   options: ChunkOptions = this.defaultChunkOptions
  // ) {
  //   try {
  //     const { chunkSize = 1000, chunkOverlap = 200 } = options;

  //     // Load web content
  //     const loader = new CheerioWebBaseLoader(url);
  //     const docs = await loader.load();

  //     // Split content into chunks
  //     const splitter = new RecursiveCharacterTextSplitter({
  //       chunkSize,
  //       chunkOverlap,
  //     });

  //     const chunks = await splitter.splitDocuments(docs);
  //     return chunks;
  //   } catch (error) {
  //     console.error("Error chunking web content:", error);
  //     throw new Error("Failed to chunk web content");
  //   }
  // }

  /**
   * Load and chunk PDF content
   */
  // async chunkPdfContent(
  //   pdfBuffer: Buffer,
  //   options: ChunkOptions = this.defaultChunkOptions
  // ) {
  //   try {
  //     const { chunkSize = 1000, chunkOverlap = 200 } = options;

  //     // Create a Blob from the buffer
  //     const blob = new Blob([pdfBuffer], { type: "application/pdf" });

  //     // Load PDF content
  //     const loader = new PDFLoader(blob);
  //     const docs = await loader.load();

  //     // Split content into chunks
  //     const splitter = new RecursiveCharacterTextSplitter({
  //       chunkSize,
  //       chunkOverlap,
  //     });

  //     const chunks = await splitter.splitDocuments(docs);
  //     return chunks;
  //   } catch (error) {
  //     console.error("Error chunking PDF content:", error);
  //     throw new Error("Failed to chunk PDF content");
  //   }
  // }
}

const chunkerService = new ChunkerService();
export default chunkerService;
