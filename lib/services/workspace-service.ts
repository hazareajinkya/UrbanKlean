import {
  arrayRemove,
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

    // Delete the workspace document
    await deleteDoc(doc(db, `workspaces/${wid}`));
  }

  async addMember(
    wid: string,
    userEmail: string,
    status: "invite" | "accepted" | "default"
  ) {
    const data = {
      status: status,
      role: "owner",
      email: userEmail,
    };

    await setDoc(doc(db, `workspaces/${wid}/members/${userEmail}`), data);
  }
}

const workspaceService = new WorkspaceService();
export default workspaceService;
