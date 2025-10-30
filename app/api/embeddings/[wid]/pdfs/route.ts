import knowledgeService from "@/lib/services/knowledge-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { tracingChannel } from "diagnostics_channel";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);

    const formData = await request.formData();
    const pdf = formData.get("file") as File;

    if (!pdf) return errorResponse("No PDF file provided", 400);
    if (!pdf.type.includes("pdf"))
      return errorResponse("File must be a PDF", 400);

    const { points, chunkSize } = await knowledgeService.s_embedPdfs(wid, pdf);

    await knowledgeService.s_savePDFKnowledge(wid, pdf, points, chunkSize);

    return successResponse(
      { wid, name: pdf.name, status: "trained" },
      "PDF embedded successfully"
    );
  } catch (error) {
    console.error("Error in PDF embedding: ", error);
    return serverErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { searchParams } = new URL(request.url);
    const did = searchParams.get("did");

    if (!did) return errorResponse("Document ID is required", 400);

    await knowledgeService.s_deletePdfKnowledge(wid, did);

    return successResponse({ wid, did }, "PDF deleted successfully");
  } catch (error) {
    console.error("Error deleting PDF: ", error);
    return serverErrorResponse(error);
  }
}
