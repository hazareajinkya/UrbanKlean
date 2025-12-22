"use server";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

const defaultChunkOptions: ChunkOptions = {
  chunkSize: 1000,
  chunkOverlap: 200,
};

/**
 * Split text into chunks
 */
export async function chunkText(
  text: string,
  options: ChunkOptions = defaultChunkOptions
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
export async function chunkPdfContent(
  pdfBuffer: Buffer,
  options: ChunkOptions = defaultChunkOptions
) {
  try {
    const { chunkSize = 1000, chunkOverlap = 200 } = options;

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF buffer is empty or invalid");
    }

    // Create a Blob from the buffer
    const blob = new Blob([new Uint8Array(pdfBuffer)], {
      type: "application/pdf",
    });

    // Load PDF content
    const loader = new PDFLoader(blob, {
      splitPages: false, // Load entire document at once for better chunking
    });
    const docs = await loader.load();

    if (!docs || docs.length === 0) {
      throw new Error("No content could be extracted from PDF");
    }

    // Split content into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });

    const chunks = await splitter.splitDocuments(docs);
    
    if (!chunks || chunks.length === 0) {
      throw new Error("PDF chunking resulted in no chunks");
    }
    
    return chunks;
  } catch (error: any) {
    console.error("Error chunking PDF content:", error);
    throw new Error(`Failed to chunk PDF content: ${error.message || "Unknown error"}`);
  }
}
