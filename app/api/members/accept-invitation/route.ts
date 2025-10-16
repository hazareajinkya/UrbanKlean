import { NextRequest, NextResponse } from "next/server";
import { acceptInvitationSchema } from "../invite/schema";
import memberService from "@/lib/services/member-service";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wid, token, userEmail } = acceptInvitationSchema.parse(body);

    // Validate invitation
    const validation = await memberService.validateInvitation(wid, token);
    if (!validation.valid) {
      return errorResponse(validation.message || "Invalid invitation");
    }

    // Accept invitation
    const result = await memberService.acceptInvitation(wid, token, userEmail);

    if (!result.success) {
      return errorResponse(result.message);
    }

    return successResponse({ success: true }, result.message);
  } catch (error: any) {
    console.error("Error accepting invitation:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", error.errors);
    }

    return serverErrorResponse(error);
  }
}
