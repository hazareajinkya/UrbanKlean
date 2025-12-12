import { NextRequest } from "next/server";
import qdClient from "@/lib/clients/qdrant-client";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import { db } from "@/lib/clients/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

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

    if (isFolderEmpty) {
      return successResponse(
        { wid, folderId },
        "Folder is empty, no Qdrant deletion needed"
      );
    }

    const { exists } = await qdClient.collectionExists(wid);
    if (!exists) {
      return successResponse(
        { wid, folderId },
        "Qdrant collection does not exist"
      );
    }

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

    return successResponse(
      { wid, folderId },
      "Folder knowledge deleted from Qdrant"
    );
  } catch (error) {
    console.error("Error deleting folder knowledge from Qdrant:", error);
    return serverErrorResponse(error);
  }
}
