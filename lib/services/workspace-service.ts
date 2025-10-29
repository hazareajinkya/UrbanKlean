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
import storageService from "./storage-service";
import axiosClient from "../clients/axios-client";

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
    // Get all members of the workspace
    const members = await getDocs(
      query(collection(db, `workspaces/${wid}/members`))
    );

    // Remove workspace from all users' workspace arrays
    for (const memberDoc of members.docs) {
      const memberEmail = memberDoc.id;
      const user = await userService.getUser(memberEmail);

      if (user) {
        const userData = user;
        const workspaces = userData.workspaces || [];
        const updatedWorkspaces = workspaces.filter((ws: any) => ws.id !== wid);
        await userService.updateUser(user.email, {
          workspaces: updatedWorkspaces,
        });
      }

      // Delete member document
      await deleteDoc(doc(db, `workspaces/${wid}/members/${memberEmail}`));
    }
    // delete all agents
    try {
      const agents = await agentService.fetchAgents(wid);
      await Promise.all(
        agents.map((agent: any) => agentService.deleteAgent({ aid: agent.id }))
      );
    } catch (err) {
      throw new Error("Failed to delete agents");
    }

    // helper function to delete collections
    const deleteCollection = async (path: string) => {
      const snap = await getDocs(collection(db, path));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    };

    // delete workspace subcollection
    await Promise.all([
      deleteCollection(`workspaces/${wid}/channels`),
      deleteCollection(`workspaces/${wid}/actions`),
      deleteCollection(`workspaces/${wid}/people`),
      deleteCollection(`workspaces/${wid}/knowledge/web/default`),
    ]);

    // delete text knowledge
    const textSnap = await getDoc(doc(db, `workspaces/${wid}/knowledge/text`));
    if (textSnap.exists()) await deleteDoc(textSnap.ref);

    // delete pdf files from storage
    const pdfSnap = await getDoc(doc(db, `workspaces/${wid}/knowledge/pdfs`));
    if (pdfSnap.exists()) {
      const data = pdfSnap.data() as any;
      const files = Array.isArray(data?.files) ? data.files : [];

      await Promise.all(
        files.map(async (f: { docUrl: string }) => {
          if (f?.docUrl) {
            try {
              await storageService.deleteFile(f.docUrl);
            } catch (err) {
              throw new Error("Failed to delete storage file.");
            }
          }
        })
      );

      await deleteDoc(pdfSnap.ref);
    }

    // delete Qdrant collection
    try {
      await axiosClient.delete(`/api/embeddings/${wid}/qdrant-delete`);
    } catch (err) {
      throw new Error(`Failed to delete Qdrant collection.`);
    }
    //  delete the workspace document
    await deleteDoc(doc(db, `workspaces/${wid}`));
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
