import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { IMember, MemberRole, MemberStatus } from "../types/member";
import { IUser } from "../types/user";
import { v4 } from "uuid";
import userService from "./user-service";

class MemberService {
  generateInvitationToken(): { token: string; expiresAt: string } {
    const token = v4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    return {
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async fetchMembers(wid: string): Promise<IMember[]> {
    const membersRef = collection(db, `workspaces/${wid}/members`);
    const membersSnap = await getDocs(membersRef);

    return membersSnap.docs.map((doc) => doc.data() as IMember);
  }

  async fetchMembersWithUserInfo(
    wid: string
  ): Promise<(IMember & { user?: IUser })[]> {
    const members = await this.fetchMembers(wid);

    // Fetch user information for each member
    const membersWithUserInfo = await Promise.all(
      members.map(async (member) => {
        try {
          const user = await userService.getUser(member.email);
          return { ...member, user };
        } catch (error) {
          console.warn(`Failed to fetch user info for ${member.email}:`, error);
          return { ...member, user: undefined };
        }
      })
    );

    return membersWithUserInfo;
  }

  async fetchMember(wid: string, email: string): Promise<IMember | null> {
    const memberRef = doc(db, `workspaces/${wid}/members/${email}`);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      return null;
    }

    return memberSnap.data() as IMember;
  }

  async inviteMember(
    wid: string,
    email: string,
    role: MemberRole,
    invitedBy: string,
    token: string,
    expiresAt: string
  ): Promise<IMember> {
    const member: IMember = {
      email,
      role,
      status: "pending",
      invitedBy,
      invitedAt: new Date().toISOString(),
      invitationToken: token,
      expiresAt,
    };

    await setDoc(doc(db, `workspaces/${wid}/members/${email}`), member);

    return member;
  }

  async acceptInvitation(
    wid: string,
    token: string,
    userEmail: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find member with matching token
      const membersRef = collection(db, `workspaces/${wid}/members`);
      const q = query(membersRef, where("invitationToken", "==", token));
      const membersSnap = await getDocs(q);

      if (membersSnap.empty) {
        return { success: false, message: "Invalid invitation token" };
      }

      const memberDoc = membersSnap.docs[0];
      const memberData = memberDoc.data() as IMember;

      // Check if token is expired
      if (memberData.expiresAt && new Date(memberData.expiresAt) < new Date()) {
        return { success: false, message: "Invitation has expired" };
      }

      // Check if email matches
      if (memberData.email !== userEmail) {
        return { success: false, message: "Email does not match invitation" };
      }

      // Update member status
      const memberRef = doc(db, `workspaces/${wid}/members/${userEmail}`);
      await updateDoc(memberRef, {
        status: "accepted",
        joinedAt: new Date().toISOString(),
        invitationToken: null, // Remove token after use
        expiresAt: null,
      });

      // Add workspace to user's workspaces array
      const user = await userService.getUser(userEmail);
      if (user) {
        const workspace = await this.getWorkspaceName(wid);
        const updatedWorkspaces = [
          ...user.workspaces,
          { id: wid, name: workspace, role: memberData.role },
        ];

        await userService.updateUser(userEmail, {
          workspaces: updatedWorkspaces,
        });
      }

      return { success: true, message: "Successfully joined workspace" };
    } catch (error) {
      console.error("Error accepting invitation:", error);
      return { success: false, message: "Failed to accept invitation" };
    }
  }

  async updateMemberRole({
    wid,
    email,
    newRole,
  }: {
    wid: string;
    email: string;
    newRole: MemberRole;
  }): Promise<void> {
    const memberRef = doc(db, `workspaces/${wid}/members/${email}`);
    await updateDoc(memberRef, {
      role: newRole,
    });

    // Also update in user's workspaces array
    const user = await userService.getUser(email);
    if (user) {
      const updatedWorkspaces = user.workspaces.map((ws) =>
        ws.id === wid ? { ...ws, role: newRole } : ws
      );

      await userService.updateUser(email, {
        workspaces: updatedWorkspaces,
      });
    }
  }

  async removeMember({
    wid,
    email,
  }: {
    wid: string;
    email: string;
  }): Promise<void> {
    // Remove from workspace members
    const memberRef = doc(db, `workspaces/${wid}/members/${email}`);
    await deleteDoc(memberRef);

    // Remove from user's workspaces array
    const user = await userService.getUser(email);
    if (user) {
      const updatedWorkspaces = user.workspaces.filter((ws) => ws.id !== wid);
      await userService.updateUser(email, {
        workspaces: updatedWorkspaces,
      });
    }
  }

  async resendInvitation(
    wid: string,
    email: string,
    invitedBy: string,
    token: string,
    expiresAt: string
  ): Promise<IMember> {
    const member = await this.fetchMember(wid, email);

    if (!member) {
      throw new Error("Member not found");
    }

    if (member.status === "accepted") {
      throw new Error("Member has already accepted the invitation");
    }

    const memberRef = doc(db, `workspaces/${wid}/members/${email}`);
    await updateDoc(memberRef, {
      invitationToken: token,
      expiresAt,
      invitedBy,
      invitedAt: new Date().toISOString(),
    });

    return {
      ...member,
      invitationToken: token,
      expiresAt,
      invitedBy,
      invitedAt: new Date().toISOString(),
    };
  }

  async validateInvitation(
    wid: string,
    token: string
  ): Promise<{
    valid: boolean;
    member?: IMember;
    message?: string;
  }> {
    try {
      const membersRef = collection(db, `workspaces/${wid}/members`);
      const q = query(membersRef, where("invitationToken", "==", token));
      const membersSnap = await getDocs(q);

      if (membersSnap.empty) {
        return { valid: false, message: "Invalid invitation token" };
      }

      const memberData = membersSnap.docs[0].data() as IMember;

      // Check if token is expired
      if (memberData.expiresAt && new Date(memberData.expiresAt) < new Date()) {
        return { valid: false, message: "Invitation has expired" };
      }

      // Check if already accepted
      if (memberData.status === "accepted") {
        return {
          valid: false,
          message: "Invitation has already been accepted",
        };
      }

      return { valid: true, member: memberData };
    } catch (error) {
      console.error("Error validating invitation:", error);
      return { valid: false, message: "Failed to validate invitation" };
    }
  }

  private async getWorkspaceName(wid: string): Promise<string> {
    try {
      const workspaceRef = doc(db, `workspaces/${wid}`);
      const workspaceSnap = await getDoc(workspaceRef);

      if (workspaceSnap.exists()) {
        return workspaceSnap.data().name || "Workspace";
      }

      return "Workspace";
    } catch (error) {
      console.error("Error fetching workspace name:", error);
      return "Workspace";
    }
  }
}

const memberService = new MemberService();
export default memberService;
