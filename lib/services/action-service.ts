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
import workflowservice from "./workflow-service";

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

  async getActionsInWorkflow(wid: string, aid: string) {
    const actions = await this.getActions(wid);
    const workflows = await workflowservice.getWorkflows(aid);
    const actionIds = new Set(workflows.flatMap((w) => w.toolIds));
    return actions.filter((action) => actionIds.has(action.id));
  }
}

const actionService = new ActionService();

export default actionService;
