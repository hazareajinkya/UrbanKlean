export type MemberRole = "owner" | "admin" | "member";
export type MemberStatus = "pending" | "accepted";

export interface IMember {
  email: string;
  role: MemberRole;
  status: MemberStatus;
  invitedBy: string;
  invitedAt: string;
  joinedAt?: string;
  invitationToken?: string;
  expiresAt?: string;
}

export interface IInvitationRequest {
  wid: string;
  email: string;
  role: MemberRole;
  invitedBy: string;
}

export interface IAcceptInvitationRequest {
  wid: string;
  token: string;
  userEmail: string;
}

// Role hierarchy and permissions
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export const canInviteMembers = (role: MemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canManageMembers = (role: MemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canDeleteWorkspace = (role: MemberRole): boolean => {
  return role === "owner";
};

export const canChangeRole = (
  userRole: MemberRole,
  targetRole: MemberRole
): boolean => {
  // Only owners can change roles, and they can't change their own role
  return userRole === "owner" && targetRole !== "owner";
};

export const canRemoveMember = (
  userRole: MemberRole,
  targetRole: MemberRole
): boolean => {
  // Users can only remove members with lower or equal hierarchy
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
};

export const getRoleDisplayName = (role: MemberRole): string => {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "member":
      return "Member";
    default:
      return "Unknown";
  }
};

export const getStatusDisplayName = (status: MemberStatus): string => {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Active";
    default:
      return "Unknown";
  }
};
