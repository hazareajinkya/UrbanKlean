"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMembers } from "@/lib/hooks/members/use-members";
import { useMemberActions } from "@/lib/hooks/members/use-member-actions";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Mail,
  MoreHorizontal,
  UserMinus,
  Plus,
  XIcon,
  RefreshCcw,
  Users,
  User,
  Trash,
  EllipsisVertical,
  Edit,
  PencilLine,
  Send,
  UserPlus,
} from "lucide-react";
import {
  MemberRole,
  getRoleDisplayName,
  canInviteMembers,
  canManageMembers,
} from "@/lib/types/member";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MembersPage() {
  const { wid } = useParams() as { wid: string };
  const { user } = useCurrentUser();
  const { data: members = [], isLoading } = useMembers(wid);
  const { inviteMember, updateMemberRole, removeMember, resendInvitation } =
    useMemberActions();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [isInviting, setIsInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    email: string;
    name: string;
    isPending: boolean;
  } | null>(null);

  // Get current user's role in this workspace
  const currentUserMember = members.find((m) => m.email === user?.email);
  const currentUserRole = currentUserMember?.role || "member";

  const handleInviteMember = async () => {
    if (!email.trim() || !user?.email) return;

    setIsInviting(true);
    try {
      await inviteMember.mutateAsync({
        wid,
        email: email.trim(),
        role,
        invitedBy: user.email,
      });
      setEmail("");
      setRole("member");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (memberEmail: string, newRole: MemberRole) => {
    try {
      await updateMemberRole.mutateAsync({
        wid,
        email: memberEmail,
        newRole,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMember.mutateAsync({
        wid,
        email: memberToRemove.email,
      });
      setMemberToRemove(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResendInvitation = async (memberEmail: string) => {
    if (!user?.email) return;

    try {
      await resendInvitation.mutateAsync({
        wid,
        email: memberEmail,
        invitedBy: user.email,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleInviteMember();
    }
  };

  const activeMembers = members.filter((m) => m.status === "accepted");
  const pendingMembers = members.filter((m) => m.status === "pending");

  const MemberSkeleton = () => (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );

  return (
    <motion.div
      key="members"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6">
        <h1 className="text-xl">Team Members</h1>
        <p className="text-muted-foreground text-sm">
          Manage your workspace members and their permissions.
        </p>
      </div>

      <Card>
        {canInviteMembers(currentUserRole) && (
          <CardHeader>
            <div className="">
              <div className="flex items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <Input
                    type="email"
                    placeholder="steve.jobs@apple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-36">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Select
                    value={role}
                    onValueChange={(value: MemberRole) => setRole(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-6.5">
                  <Button
                    onClick={handleInviteMember}
                    disabled={!email.trim() || isInviting}
                  >
                    {isInviting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Invitation
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent
          className={canInviteMembers(currentUserRole) ? "" : "pt-6"}
        >
          {canInviteMembers(currentUserRole) && (
            <div className="border-t"></div>
          )}

          <div
            className={`divide-y ${
              canInviteMembers(currentUserRole) ? "mt-6" : ""
            } divide-gray-200`}
          >
            {isLoading ? (
              <>
                <MemberSkeleton />
                <MemberSkeleton />
                <MemberSkeleton />
              </>
            ) : (
              activeMembers.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={
                          member.user?.photoUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${member.email}`
                        }
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {member.user?.name?.charAt(0)?.toUpperCase() ||
                          member.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.user?.name ||
                          member.email
                            .split("@")[0]
                            .replace(/[._]/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={
                        "text-xs px-3 py-1 rounded-md bg-primary/5 text-primary"
                      }
                      aria-label={`Role: ${getRoleDisplayName(member.role)}`}
                      tabIndex={0}
                    >
                      {getRoleDisplayName(member.role)}
                    </span>

                    {canManageMembers(currentUserRole) &&
                      member.email !== user?.email && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const newRole =
                                  member.role === "admin" ? "member" : "admin";
                                handleUpdateRole(member.email, newRole);
                              }}
                            >
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setMemberToRemove({
                                  email: member.email,
                                  name:
                                    member.user?.name ||
                                    member.email
                                      .split("@")[0]
                                      .replace(/[._]/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase()),
                                  isPending: false,
                                })
                              }
                              className="text-red-600"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>

          {pendingMembers.length > 0 && !isLoading && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-muted-foreground">Pending Invitations</h3>

              <div className="divide-y divide-gray-200 mt-4">
                {pendingMembers.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <Mail className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="">{member.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Invitation sent
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs px-3 py-1 rounded-md bg-primary/5 text-primary">
                        {getRoleDisplayName(member.role)}
                      </div>
                      {canManageMembers(currentUserRole) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleResendInvitation(member.email)
                              }
                            >
                              {resendInvitation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCcw className="w-4 h-4" />
                              )}
                              Resend Invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setMemberToRemove({
                                  email: member.email,
                                  name: member.email,
                                  isPending: true,
                                })
                              }
                              className="text-red-600"
                            >
                              <XIcon className="w-4 h-4 mr-2" />
                              Cancel Invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && members.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No members found</div>
          {canInviteMembers(currentUserRole) && (
            <Button
              onClick={() => setEmail("")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite your first member
            </Button>
          )}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title={
          memberToRemove?.isPending ? "Cancel Invitation" : "Remove Team Member"
        }
        description={
          memberToRemove?.isPending
            ? `Are you sure you want to cancel the invitation for ${memberToRemove?.name}?`
            : `Are you sure you want to remove ${memberToRemove?.name} from this workspace?`
        }
        warningMessage={
          memberToRemove?.isPending
            ? "The invitation will be cancelled and they will not be able to join."
            : "This member will lose access to the workspace immediately and all their permissions will be revoked."
        }
        confirmText={
          memberToRemove?.isPending ? "Cancel Invitation" : "Remove Member"
        }
        cancelText="Keep"
        isLoading={removeMember.isPending}
        variant="destructive"
      />
    </motion.div>
  );
}
