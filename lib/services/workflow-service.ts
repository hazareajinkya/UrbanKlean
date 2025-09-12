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

class WorkflowService {
  async createWorkflow({
    aid,
    workflow,
  }: {
    aid: string;
    workflow: IWorkflow;
  }) {
    await setDoc(doc(db, `agents/${aid}/workflows/${workflow.id}`), workflow);
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
      updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteWorkflow({
    aid,
    workflowId,
  }: {
    aid: string;
    workflowId: string;
  }) {
    await deleteDoc(doc(db, `agents/${aid}/workflows/${workflowId}`));
  }

  async getWorkflow(aid: string, workflowId: string) {
    const docRef = doc(db, `agents/${aid}/workflows/${workflowId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as IWorkflow;
  }

  async getWorkflows(aid: string) {
    const docRef = collection(db, `agents/${aid}/workflows`);
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map((doc) => doc.data() as IWorkflow);
  }
}

const workflowservice = new WorkflowService();

export default workflowservice;
