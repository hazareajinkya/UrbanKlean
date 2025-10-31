import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { generateDefaultWorkspace, IWorkspace } from "../types/workspace";
import userService from "./user-service";
import agentService from "./agent-service";
import axiosClient from "../clients/axios-client";
import { deleteCollection } from "../utils";
import memberService from "./member-service";
import { IAgent } from "../types/agent";
import knowledgeService from "./knowledge-service";

class WorkspaceService {
  async fetchWorkspaces(ids: string[]) {
    if (ids.length === 0) return [];

    const q = query(collection(db, "workspaces"), where("id", "in", ids));
    const workspaces = await getDocs(q);
    return workspaces.docs.map((doc) => doc.data()) as IWorkspace[];
  }

  async fetchWorkspace(id: string) {
    const docRef = doc(db, `workspaces/${id}`);
    const snap = await getDoc(docRef);
    return snap.data() as IWorkspace;
  }

  async createWorkspace({
    name,
    description,
    ownerId,
  }: {
    name: string;
    description: string;
    ownerId: string;
  }) {
    const workspace = generateDefaultWorkspace();
    const wid = workspace.id;
    workspace.name = name;
    workspace.description = description;
    workspace.ownerId = ownerId;
    //create workspace
    await setDoc(doc(db, `workspaces/${wid}`), workspace);
    //add user as owner
    await setDoc(doc(db, `workspaces/${wid}/members/${ownerId}`), {
      status: "accepted",
      role: "owner",
      email: ownerId,
    });
    //also add in users collection
    await updateDoc(doc(db, `users/${ownerId}`), {
      workspaces: arrayUnion({ id: wid, name: name, role: "owner" }),
      updatedAt: new Date().toISOString(),
    });

    return workspace;
  }

  async updateWorkspace({
    wid,
    updates,
  }: {
    wid: string;
    updates: Partial<IWorkspace>;
  }) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, `workspaces/${wid}`), updateData);

    if (updates.name) {
      const members = await getDocs(
        query(collection(db, `workspaces/${wid}/members`))
      );

      for (const memberDoc of members.docs) {
        const memberEmail = memberDoc.id;
        const user = await userService.getUser(memberEmail);

        if (user) {
          const userData = user;
          const workspaces = userData.workspaces || [];
          const updatedWorkspaces = workspaces.map((ws: any) =>
            ws.id === wid ? { ...ws, name: updates.name } : ws
          );

          await userService.updateUser(memberEmail, {
            workspaces: updatedWorkspaces,
          });
        }
      }
    }
  }

  async deleteWorkspace({ wid }: { wid: string }) {
    try {
      // Delete workspace members
      try {
        const members = await memberService.fetchMembers(wid);
        if (!members?.length) return;
        const promises = members.map((member) =>
          memberService.removeMember({ wid, email: member.email })
        );
        await Promise.all(promises);
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete members:`, error);
        throw new Error("Failed to delete members.");
      }

      // Delete workspace agent
      try {
        const agents = await agentService.fetchAgents(wid);
        if (!agents?.length) return;
        const promises = agents.map((agent: IAgent) =>
          agentService.deleteAgent({ aid: agent.id! })
        );
        await Promise.all(promises);
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete agents:`, error);
        throw new Error("Failed to delete agents.");
      }
      try {
        // Delete workspace knowledge
        await Promise.all([
          knowledgeService.deleteAllTextKnowledge(wid),
          knowledgeService.deleteAllPdfKnowledge(wid),
          knowledgeService.deleteAllWebKnowledge(wid),
        ]);
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete knowledge:`, error);
        throw new Error("Failed to delete knowledge.");
      }

      // Delete Qdrant collection
      try {
        await axiosClient.delete(`/api/embeddings/${wid}/qdrant-delete`);
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete Qdrant:`, error);
        throw new Error("Failed to delete Qdrant collection.");
      }

      // Delete web knowledge collection
      await deleteCollection(`workspaces/${wid}/knowledge/web/default`);

      // Delete subcollections
      const subCollections = [
        `workspaces/${wid}/channels`,
        `workspaces/${wid}/actions`,
        `workspaces/${wid}/people`,
        `workspaces/${wid}/knowledge`,
        `workspaces/${wid}/members`,
      ];

      await Promise.all(subCollections.map((path) => deleteCollection(path)));

      //  Delete document
      await deleteDoc(doc(db, `workspaces/${wid}`));
    } catch (error: any) {
      console.error(
        `[WorkspaceService] Failed to delete workspace ${wid}:`,
        error
      );
      throw new Error(`Failed to delete workspace: ${error?.message || error}`);
    }
  }

  async addMember(
    wid: string,
    userEmail: string,
    role: "owner" | "admin" | "member" = "member",
    status: "invite" | "accepted" | "default" = "default"
  ) {
    const data = {
      status: status,
      role: role,
      email: userEmail,
    };

    await setDoc(doc(db, `workspaces/${wid}/members/${userEmail}`), data);
  }
}

const workspaceService = new WorkspaceService();
export default workspaceService;
