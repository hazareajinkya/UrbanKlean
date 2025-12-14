"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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
        <h2 className="text-xl font-medium">Team Members</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace members and their permissions.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Invite Member Section */}
          {canInviteMembers(currentUserRole) && (
            <>
              <div className="space-y-2">
                <Label>Invite New Member</Label>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input
                    type="email"
                    placeholder="steve.jobs@apple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    className="w-full"
                  />
                  <Select
                    value={role}
                    onValueChange={(value: MemberRole) => setRole(value)}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleInviteMember}
                    disabled={!email.trim() || isInviting}
                    className="w-full sm:w-auto"
                  >
                    {isInviting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Member
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter an email address to invite a new team member.
                </p>
              </div>

              <Separator />
            </>
          )}

          {/* Active Members Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Active Members</h3>
            <div className="rounded-lg border" role="list">
              <AnimatePresence initial={false} mode="popLayout">
                {isLoading ? (
                  <>
                    <MemberSkeleton />
                    <MemberSkeleton />
                    <MemberSkeleton />
                  </>
                ) : activeMembers.length === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center"
                  >
                    <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium">No members yet</p>
                    <p className="text-xs text-muted-foreground">
                      Invite your first team member to get started.
                    </p>
                  </motion.div>
                ) : (
                  activeMembers.map((member, index) => (
                    <motion.div
                      key={member.email}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-center justify-between p-3 hover:bg-accent/50 transition-colors",
                        index !== activeMembers.length - 1 && "border-b"
                      )}
                      role="listitem"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Avatar>
                            <AvatarFallback>
                              {member.user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                            <AvatarImage src={member.user?.photoUrl} />
                          </Avatar>
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            {member.user?.name ||
                              member.email
                                .split("@")[0]
                                .replace(/[._]/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {member.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {getRoleDisplayName(member.role)}
                        </span>
                        {canManageMembers(currentUserRole) &&
                          member.email !== user?.email && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    const newRole =
                                      member.role === "admin"
                                        ? "member"
                                        : "admin";
                                    handleUpdateRole(member.email, newRole);
                                  }}
                                >
                                  <PencilLine className="w-4 h-4 mr-2" />
                                  Change to{" "}
                                  {member.role === "admin" ? "Member" : "Admin"}
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
                                          .replace(/\b\w/g, (l) =>
                                            l.toUpperCase()
                                          ),
                                      isPending: false,
                                    })
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <UserMinus className="w-4 h-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pending Invitations Section */}
          {pendingMembers.length > 0 && !isLoading && (
            <>
              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-3">
                  Pending Invitations
                </h3>
                <div className="rounded-lg border" role="list">
                  <AnimatePresence initial={false} mode="popLayout">
                    {pendingMembers.map((member, index) => (
                      <motion.div
                        key={member.email}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex items-center justify-between p-3 hover:bg-accent/50 transition-colors",
                          index !== pendingMembers.length - 1 && "border-b"
                        )}
                        role="listitem"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium">
                            {member.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {getRoleDisplayName(member.role)}
                          </span>
                          {canManageMembers(currentUserRole) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleResendInvitation(member.email)
                                  }
                                >
                                  {resendInvitation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <RefreshCcw className="w-4 h-4 mr-2" />
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
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XIcon className="w-4 h-4 mr-2" />
                                  Cancel Invitation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
