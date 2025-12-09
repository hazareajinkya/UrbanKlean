import knowledgeService from "@/lib/services/knowledge-service";
import folderService from "@/lib/services/folder-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { NextRequest } from "next/server";
import { v4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const formData = await request.formData();
    const pdf = formData.get("file") as File;

    if (!pdf) return errorResponse("No PDF file provided", 400);
    if (!pdf.type.includes("pdf"))
      return errorResponse("File must be a PDF", 400);

    const documentId = v4();
    const { points, chunkSize } = await knowledgeService.s_embedPdfs(
      wid,
      folderId,
      documentId,
      pdf
    );

    await knowledgeService.s_savePDFKnowledge(
      wid,
      folderId,
      pdf,
      points,
      chunkSize
    );

    // Update folder item count
    await folderService.updateFolderItemCount(wid, folderId, "documents", 1);

    return successResponse(
      { wid, folderId, documentId, name: pdf.name, status: "trained" },
      "PDF embedded successfully"
    );
  } catch (error: any) {
    console.error("Error in PDF embedding: ", error);
    const message = error?.message || "Failed to process PDF";
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const { searchParams } = new URL(request.url);
    const did = searchParams.get("did");

    if (!did) return errorResponse("Document ID is required", 400);

    await knowledgeService.s_deletePdfKnowledge(wid, folderId, did);

    // Update folder item count
    await folderService.updateFolderItemCount(wid, folderId, "documents", -1);

    return successResponse({ wid, folderId, did }, "PDF deleted successfully");
  } catch (error) {
    console.error("Error deleting PDF: ", error);
    return serverErrorResponse(error);
  }
}
