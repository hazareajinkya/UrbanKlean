import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { generateDefaultWorkspace, IWorkspace } from "../types/workspace";

class WorkspaceService {
  async fetchWorkspaces(ids: string[]) {
    if (ids.length === 0) return [];

    const q = query(collection(db, "workspaces"), where("id", "in", ids));
    const workspaces = await getDocs(q);
    return workspaces.docs.map((doc) => doc.data()) as IWorkspace[];
  }

  async createWorkspace({ name, ownerId }: { name: string; ownerId: string }) {
    const workspace = generateDefaultWorkspace();
    const wid = workspace.id;
    workspace.name = name;
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
