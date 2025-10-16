import { z } from "zod";

export const inviteMemberSchema = z.object({
  wid: z.string().min(1, "Workspace ID is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "member"]),
  invitedBy: z.string().email("Invalid inviter email"),
});

export const acceptInvitationSchema = z.object({
  wid: z.string().min(1, "Workspace ID is required"),
  token: z.string().min(1, "Token is required"),
  userEmail: z.string().email("Invalid email address"),
});

export type InviteMemberRequest = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationRequest = z.infer<typeof acceptInvitationSchema>;
