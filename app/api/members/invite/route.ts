import { NextRequest, NextResponse } from "next/server";
import { inviteMemberSchema } from "./schema";
import memberService from "@/lib/services/member-service";
import workspaceService from "@/lib/services/workspace-service";
import resendService from "@/lib/services/resend/resend-service";
import { generateInvitationEmail } from "@/lib/services/resend/email-templates";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import { resendClient } from "@/lib/clients/axios-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wid, email, role, invitedBy } = inviteMemberSchema.parse(body);

    // Check if member already exists
    const existingMember = await memberService.fetchMember(wid, email);

    if (existingMember) {
      if (existingMember.status === "accepted") {
        return errorResponse("User is already a member of this workspace");
      }

      // If pending, generate new token and send invitation
      const { token, expiresAt } = memberService.generateInvitationToken();

      // Send email first
      await sendInvitationEmail(wid, email, token, invitedBy);

      // Only update member in DB after email is sent successfully
      const member = await memberService.resendInvitation(
        wid,
        email,
        invitedBy,
        token,
        expiresAt
      );

      return successResponse(
        { member, token },
        "Invitation resent successfully"
      );
    }

    // Generate invitation token
    const { token, expiresAt } = memberService.generateInvitationToken();

    // Send email first
    await sendInvitationEmail(wid, email, token, invitedBy);

    // Only add member to DB after email is sent successfully
    const member = await memberService.inviteMember(
      wid,
      email,
      role,
      invitedBy,
      token,
      expiresAt
    );

    return successResponse({ member, token }, "Invitation sent successfully");
  } catch (error: any) {
    console.error("Error sending invitation:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", error.errors);
    }

    return serverErrorResponse(error);
  }
}

const sendInvitationEmail = async (
  wid: string,
  email: string,
  token: string,
  invitedBy: string
) => {
  const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invite?wid=${wid}&token=${token}`;
  const workspace = await workspaceService.fetchWorkspace(wid);
  const workspaceName = workspace?.name || "Workspace";
  const inviterName = invitedBy.split("@")[0];

  // const emailHtml = generateInvitationEmail(
  //   workspaceName,
  //   inviterName,
  //   invitationLink
  // );

  await resendService.sendEmail({
    to: email,
    subject: `You're invited to join ${workspaceName} on Magical CX`,
    template: {
      id: "invite",
      variables: {
        workspaceName,
        invitationLink,
        inviterName,
      },
    },
  });
};
