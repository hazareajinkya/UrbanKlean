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
import { IWorkflow } from "../types/workflow";
import cacheService from "./cache-service";
import { invalidateCache } from "../utils/cache-utils";

class ActionService {
  // Fetches all actions (with caching), applies filters in memory if needed
  async getActions(
    wid: string,
    filters?: { ids?: string[]; type?: IAction["type"] }
  ) {
    // Try cache first (always cache ALL actions for workspace)
    let actions = await cacheService.getActions(wid);

    if (!actions) {
      // Cache miss - fetch ALL from Firestore (no filters)
      const collectionRef = collection(db, `workspaces/${wid}/actions`);
      const snap = await getDocs(collectionRef);
      actions = snap.docs.map((doc) => doc.data() as IAction);

      // Store all actions in cache (fire and forget)
      cacheService.setActions(wid, actions);
    }

    // Apply filters in memory
    if (filters?.ids && filters.ids.length > 0) {
      const idSet = new Set(filters.ids);
      actions = actions.filter((a) => idSet.has(a.id));
    }

    if (filters?.type) {
      actions = actions.filter((a) => a.type === filters.type);
    }

    return actions;
  }

  async getAction(wid: string, actionId: string) {
    const snap = await getDoc(doc(db, `workspaces/${wid}/actions/${actionId}`));
    return snap.data() as IAction;
  }

  async saveAction({ wid, action }: { wid: string; action: IAction }) {
    await setDoc(doc(db, `workspaces/${wid}/actions/${action.id}`), action);

    // Invalidate server-side cache via API
    invalidateCache({ type: "actions", id: wid });
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

    // Invalidate server-side cache via API
    invalidateCache({ type: "actions", id: wid });
  }

  async deleteAction({ wid, actionId }: { wid: string; actionId: string }) {
    await deleteDoc(doc(db, `workspaces/${wid}/actions/${actionId}`));

    // Invalidate server-side cache via API
    invalidateCache({ type: "actions", id: wid });
  }

  async getActionsForWorflows(wid: string, workflows: IWorkflow[]) {
    const actionIds = new Set(workflows.flatMap((w) => w.toolIds ?? []));
    // Short-circuit: no workflows or no toolIds means no actions
    if (actionIds.size === 0) return [];
    return this.getActions(wid, { ids: Array.from(actionIds) });
  }
}

const actionService = new ActionService();

export default actionService;
