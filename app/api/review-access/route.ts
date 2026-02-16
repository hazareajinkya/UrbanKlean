/**
 * TEMPORARY: Remove this route (and app/review-access/page.tsx) after review approval.
 */
import { NextRequest } from "next/server";
import userService from "@/lib/services/user-service";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

const REVIEW_ACCESS_TOKEN = "m7Kp2xQn9vL4wRj8Hs3fBc6Yz1Aa5Td0";
const REVIEW_TEST_USER_EMAIL = "reviewer@magicalcx.com";
const REVIEW_WORKSPACE_ID = "5b838a15-3beb-4c4b-b00c-cf3a4454ac9a";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token || token !== REVIEW_ACCESS_TOKEN)
      return errorResponse("Invalid or expired link", 401);

    const user = await userService.getUser(REVIEW_TEST_USER_EMAIL);
    if (!user) return errorResponse("Review user not found", 404);

    return successResponse(
      { email: user.email, id: user.id, workspaceId: REVIEW_WORKSPACE_ID },
      "OK",
    );
  } catch (error) {
    return serverErrorResponse(error as Error);
  }
}
