import {
  MemberRole,
  canInviteMembers,
  canManageMembers,
  canDeleteWorkspace,
  canChangeRole,
  canRemoveMember,
} from "@/lib/types/member";

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

// Permission check helper
export const hasPermission = (
  userRole: MemberRole,
  permission: (role: MemberRole) => boolean
): boolean => {
  return permission(userRole);
};
