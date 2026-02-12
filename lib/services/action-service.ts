import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { IAction, IActionAuthorization } from "../types/actions";
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

  async toggleActionStatus({
    wid,
    actionId,
    status,
  }: {
    wid: string;
    actionId: string;
    status: "active" | "inactive";
  }) {
    await updateDoc(doc(db, `workspaces/${wid}/actions/${actionId}`), {
      status,
      updatedAt: new Date().toISOString(),
    });

    // Invalidate server-side cache via API
    invalidateCache({ type: "actions", id: wid });
  }


  async getGlobalActions(appSlug?: string) {
    const actionsRef = collection(db, "actions");
    const snap = await getDocs(actionsRef);
    const allActions = snap.docs.map((d) => d.data() as IAction);

    let result = allActions;
    if (appSlug) {
      result = allActions.filter(
        (a) => a.app?.slug === appSlug || a.app?.id === appSlug
      );
    }

    return result;
  }

  async addIntegrationAction({
    wid,
    globalAction,
  }: {
    wid: string;
    globalAction: IAction;
  }) {
    const workspaceAction: IAction = {
      ...globalAction,
      id: uuidv4(),
      originalId: globalAction.id,
      wid,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(
      doc(db, `workspaces/${wid}/actions/${workspaceAction.id}`),
      workspaceAction
    );

    invalidateCache({ type: "actions", id: wid });

    return workspaceAction;
  }

  async encryptActionAuthorization({
    authorization,
    existingAuthorization,
  }: {
    authorization: IActionAuthorization;
    existingAuthorization?: IActionAuthorization;
  }): Promise<IActionAuthorization> {
    const settingsToEncrypt: Record<string, string> = {};

    if (authorization.type === "api-key" && authorization.apiKey?.value) {
      const oldValue =
        existingAuthorization?.type === "api-key"
          ? existingAuthorization.apiKey?.value
          : undefined;

      if (!existingAuthorization || authorization.apiKey.value !== oldValue) {
        settingsToEncrypt["apiKey"] = authorization.apiKey.value;
      }
    } else if (
      authorization.type === "bearer-token" &&
      authorization.bearerToken?.token
    ) {
      const oldValue =
        existingAuthorization?.type === "bearer-token"
          ? existingAuthorization.bearerToken?.token
          : undefined;

      if (
        !existingAuthorization ||
        authorization.bearerToken.token !== oldValue
      ) {
        settingsToEncrypt["bearerToken"] = authorization.bearerToken.token;
      }
    } else if (
      authorization.type === "basic" &&
      authorization.basic
    ) {
      const oldUsername =
        existingAuthorization?.type === "basic"
          ? existingAuthorization.basic?.username
          : undefined;
      const oldPassword =
        existingAuthorization?.type === "basic"
          ? existingAuthorization.basic?.password
          : undefined;

      if (
        authorization.basic.username &&
        (!existingAuthorization || authorization.basic.username !== oldUsername)
      ) {
        settingsToEncrypt["username"] = authorization.basic.username;
      }
      if (
        authorization.basic.password &&
        (!existingAuthorization || authorization.basic.password !== oldPassword)
      ) {
        settingsToEncrypt["password"] = authorization.basic.password;
      }
    }

    // Nothing to encrypt — return as-is
    if (Object.keys(settingsToEncrypt).length === 0) {
      return authorization;
    }

    const response = await axios.post("/api/apps/encrypt-settings", {
      settings: settingsToEncrypt,
    });

    const encryptedSettings = response.data?.data?.encryptedSettings;
    if (!encryptedSettings) {
      return authorization;
    }

    const updated = { ...authorization };

    if (updated.type === "api-key" && encryptedSettings["apiKey"]) {
      updated.apiKey = {
        ...updated.apiKey!,
        value: encryptedSettings["apiKey"],
      };
    }

    if (updated.type === "bearer-token" && encryptedSettings["bearerToken"]) {
      updated.bearerToken = {
        ...updated.bearerToken!,
        token: encryptedSettings["bearerToken"],
      };
    }

    if (updated.type === "basic") {
      updated.basic = {
        ...updated.basic!,
        ...(encryptedSettings["username"] && { username: encryptedSettings["username"] }),
        ...(encryptedSettings["password"] && { password: encryptedSettings["password"] }),
      };
    }

    return updated;
  }
}

const actionService = new ActionService();

export default actionService;
