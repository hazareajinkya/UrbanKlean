import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { IWorkflow } from "../types/workflow";
import { db } from "../clients/firebase";
import cacheService from "./cache-service";
import { invalidateCache } from "../utils/cache-utils";
import actionService from "./action-service";

class WorkflowService {
  async createWorkflow({
    wid,
    workflow,
  }: {
    wid: string;
    workflow: IWorkflow;
  }) {
    await setDoc(
      doc(db, `workspaces/${wid}/workflows/${workflow.id}`),
      workflow,
    );

    invalidateCache({ type: "workflows", id: wid });
  }

  async updateWorkflow({
    wid,
    workflowId,
    updates,
  }: {
    wid: string;
    workflowId: string;
    updates: Partial<IWorkflow>;
  }) {
    await updateDoc(doc(db, `workspaces/${wid}/workflows/${workflowId}`), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    invalidateCache({ type: "workflows", id: wid });
  }

  async getWorkflow(wid: string, workflowId: string) {
    const docRef = doc(db, `workspaces/${wid}/workflows/${workflowId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as IWorkflow;
  }

  async getWorkflows(wid: string, aid?: string) {
    let workflows = await cacheService.getWorkflows(wid);

    if (!workflows) {
      const colRef = collection(db, `workspaces/${wid}/workflows`);
      const snap = await getDocs(colRef);
      workflows = snap.docs.map((doc) => doc.data() as IWorkflow);

      cacheService.setWorkflows(wid, workflows);
    }

    return workflows.filter(
      (w) => w.isActive && (!aid || (w.aids ?? []).includes(aid)),
    );
  }

  async deleteWorkflow({
    wid,
    workflowId,
  }: {
    wid: string;
    workflowId: string;
  }) {
    await deleteDoc(doc(db, `workspaces/${wid}/workflows/${workflowId}`));

    // Invalidate server-side cache via API
    invalidateCache({ type: "workflows", id: wid });
  }

  async getGlobalWorkflows() {
    const workflowsRef = collection(db, "workflows");
    const snap = await getDocs(workflowsRef);
    return snap.docs.map((d) => d.data() as IWorkflow);
  }

  async addIntegrationWorkflow({
    wid,
    globalWorkflow,
  }: {
    wid: string;
    globalWorkflow: IWorkflow;
  }) {
    const workspaceActions = (await actionService.getActions(wid)) ?? [];

    const originalIdToWorkspaceId = new Map<string, string>();
    workspaceActions.forEach((a) => {
      if (a.originalId) {
        originalIdToWorkspaceId.set(a.originalId, a.id);
      }
    });

    const mappedToolIds: string[] = [];

    for (const toolId of globalWorkflow.toolIds) {
      const existingId = originalIdToWorkspaceId.get(toolId);
      if (existingId) {
        mappedToolIds.push(existingId);
        continue;
      }

      try {
        const globalAction = await actionService.getGlobalAction(toolId);
        if (globalAction) {
          const installed = await actionService.addIntegrationAction({
            wid,
            globalAction,
          });
          mappedToolIds.push(installed.id);
        }
      } catch (error) {
        console.error(
          `Failed to install action ${toolId} for workflow:`,
          error,
        );
      }
    }

    const workspaceWorkflow: IWorkflow = {
      ...globalWorkflow,
      id: uuidv4(),
      originalId: globalWorkflow.id,
      wid,
      toolIds: mappedToolIds,
      aids: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(
      doc(db, `workspaces/${wid}/workflows/${workspaceWorkflow.id}`),
      workspaceWorkflow,
    );

    invalidateCache({ type: "workflows", id: wid });

    return workspaceWorkflow;
  }

  async toggleWorkflowStatus({
    wid,
    workflowId,
    isActive,
  }: {
    wid: string;
    workflowId: string;
    isActive: boolean;
  }) {
    await updateDoc(doc(db, `workspaces/${wid}/workflows/${workflowId}`), {
      isActive,
      updatedAt: new Date().toISOString(),
    });

    invalidateCache({ type: "workflows", id: wid });
  }
}

const workflowservice = new WorkflowService();

export default workflowservice;
