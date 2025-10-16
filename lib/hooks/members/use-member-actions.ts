import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/clients/axios-client";
import memberService from "@/lib/services/member-service";
import { toast } from "sonner";
import { MemberRole } from "@/lib/types/member";
import { membersKey } from "./use-members";

export const useMemberActions = () => {
  const queryClient = useQueryClient();

  const inviteMember = useMutation({
    mutationFn: async (data: {
      wid: string;
      email: string;
      role: MemberRole;
      invitedBy: string;
    }) => {
      const response = await apiClient.post("/api/members/invite", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: membersKey(variables.wid) });
      toast.success("Invitation sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: memberService.updateMemberRole,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: membersKey(variables.wid) });
      toast.success("Member role updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update member role");
    },
  });

  const removeMember = useMutation({
    mutationFn: memberService.removeMember,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: membersKey(variables.wid) });
      toast.success("Member removed successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to remove member");
    },
  });

  const resendInvitation = useMutation({
    mutationFn: async (data: {
      wid: string;
      email: string;
      invitedBy: string;
    }) => {
      const response = await apiClient.post("/api/members/invite", {
        ...data,
        role: "member", // Default role for resend
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Invitation resent successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to resend invitation"
      );
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (data: {
      wid: string;
      token: string;
      userEmail: string;
    }) => {
      const response = await apiClient.post(
        "/api/members/accept-invitation",
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: membersKey(variables.wid) });
      toast.success("Successfully joined workspace");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to accept invitation"
      );
    },
  });

  return {
    inviteMember,
    updateMemberRole,
    removeMember,
    resendInvitation,
    acceptInvitation,
  };
};
