import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { IWorkflow } from "../types/workflow";
import { db } from "../clients/firebase";
import cacheService from "./cache-service";
import { invalidateCache } from "../utils/cache-utils";

class WorkflowService {
  async createWorkflow({
    aid,
    workflow,
  }: {
    aid: string;
    workflow: IWorkflow;
  }) {
    await setDoc(doc(db, `agents/${aid}/workflows/${workflow.id}`), workflow);

    // Invalidate server-side cache via API
    invalidateCache({ type: "workflows", id: aid });
  }

  async updateWorkflow({
    aid,
    workflowId,
    updates,
  }: {
    aid: string;
    workflowId: string;
    updates: Partial<IWorkflow>;
  }) {
    await updateDoc(doc(db, `agents/${aid}/workflows/${workflowId}`), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // Invalidate server-side cache via API
    invalidateCache({ type: "workflows", id: aid });
  }

  async getWorkflow(aid: string, workflowId: string) {
    const docRef = doc(db, `agents/${aid}/workflows/${workflowId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as IWorkflow;
  }

  async getWorkflows(aid: string) {
    // Try cache first
    const cached = await cacheService.getWorkflows(aid);
    if (cached) return cached;

    // Cache miss - fetch from Firestore
    const docRef = collection(db, `agents/${aid}/workflows`);
    const docSnap = await getDocs(docRef);
    const workflows = docSnap.docs.map((doc) => doc.data() as IWorkflow);

    // Store in cache (fire and forget)
    cacheService.setWorkflows(aid, workflows);

    return workflows;
  }

  async deleteWorkflow({
    aid,
    workflowId,
  }: {
    aid: string;
    workflowId: string;
  }) {
    await deleteDoc(doc(db, `agents/${aid}/workflows/${workflowId}`));

    // Invalidate server-side cache via API
    invalidateCache({ type: "workflows", id: aid });
  }
}

const workflowservice = new WorkflowService();

export default workflowservice;
