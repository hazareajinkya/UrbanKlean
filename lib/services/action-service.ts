import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { IAction } from "../types/actions";
import { db } from "../clients/firebase";

class ActionService {
  async getActions(wid: string) {
    const snap = await getDocs(collection(db, `workspaces/${wid}/actions`));
    return snap.docs.map((doc) => doc.data() as IAction);
  }

  async getAction(wid: string, actionId: string) {
    const snap = await getDoc(doc(db, `workspaces/${wid}/actions/${actionId}`));
    return snap.data() as IAction;
  }

  async saveAction({ wid, action }: { wid: string; action: IAction }) {
    await setDoc(doc(db, `workspaces/${wid}/actions/${action.id}`), action);
  }

  async updateAction({
    wid,
    updates,
  }: {
    wid: string;
    updates: Partial<IAction>;
  }) {
    await updateDoc(doc(db, `workspaces/${wid}/actions/${updates.id}`), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteAction({ wid, actionId }: { wid: string; actionId: string }) {
    await deleteDoc(doc(db, `workspaces/${wid}/actions/${actionId}`));
  }
}

const actionService = new ActionService();

export default actionService;
