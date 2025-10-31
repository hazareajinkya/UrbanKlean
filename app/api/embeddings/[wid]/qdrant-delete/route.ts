import { NextRequest } from "next/server";
import qdClient from "@/lib/clients/qdrant-client";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { exists } = await qdClient.collectionExists(wid);
    if (exists) {
      await qdClient.deleteCollection(wid);
    }
    return successResponse(
      { wid },
      "Qdrant collection deleted or did not exist"
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}
