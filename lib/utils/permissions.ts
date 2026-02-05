import {
  MemberRole,
  canInviteMembers,
  canManageMembers,
  canDeleteWorkspace,
  canChangeRole,
  canRemoveMember,
} from "@/lib/types/member";
import { IWorkspace } from "../types/workspace";
import { IPlanId } from "../types/user";

// Re-export member permission functions for convenience
export {
  canInviteMembers,
  canManageMembers,
  canDeleteWorkspace,
  canChangeRole,
  canRemoveMember,
};

// Additional workspace-level permissions
export const canCreateAgents = (role: MemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canManageChannels = (role: MemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canManageKnowledge = (role: MemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canViewAnalytics = (role: MemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canManageWorkflows = (role: MemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canCreateWorkspace = (planId?: IPlanId): boolean => {
  if (!planId) return false;
  return planId !== "none";
};

export const canAccessWorkspace = (workspace?: IWorkspace | null): boolean => {
  if (!workspace) return false;
  return workspace.planId !== "none";
};
// Permission check helper
export const hasPermission = (
  userRole: MemberRole,
  permission: (role: MemberRole) => boolean
): boolean => {
  return permission(userRole);
};
