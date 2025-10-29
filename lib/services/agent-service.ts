import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  where,
  updateDoc,
  query,
} from "firebase/firestore";

import { db } from "../clients/firebase";
import { generateDefaultAgent, IAgent } from "../types/agent";
import workspaceService from "./workspace-service";

class AgentService {
  async createAgent({ wid, name }: { wid: string; name: string }) {
    const workspace = await workspaceService.fetchWorkspace(wid);
    const agent = generateDefaultAgent(wid, name, workspace);
    await setDoc(doc(db, `agents/${agent.id}`), agent);
    return agent;
  }

  async fetchAgents(wid: string) {
    const q = query(collection(db, `agents`), where("wid", "==", wid));
    const agents = await getDocs(q);
    return agents.docs.map((doc) => doc.data()) as IAgent[] | [];
  }

  async fetchAgent(aid: string) {
    const agent = await getDoc(doc(db, `agents/${aid}`));
    if (!agent.exists()) return null;
    return agent.data() as IAgent;
  }

  async updateAgent({
    aid,
    updates,
  }: {
    aid: string;
    updates: Partial<IAgent>;
  }) {
    await updateDoc(doc(db, `agents/${aid}`), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  deleteAgent = async ({ aid }: { aid: string }) => {
    // Fetch agent
    const agent = await this.fetchAgent(aid);
    if (!agent) {
      console.warn(`Agent ${aid} not found. Skipping.`);
      return;
    }

    // Helper fucntion to delete subcollection
    const deleteSubcollection = async (path: string) => {
      const snap = await getDocs(collection(db, path));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    };

    // delete subcollections
    await Promise.all([
      deleteSubcollection(`agents/${aid}/sessions`),
      deleteSubcollection(`agents/${aid}/workflows`),
    ]);

    // Unassign from channels
    if (Array.isArray(agent.channels) && agent.channels.length && agent.wid) {
      await Promise.all(
        agent.channels.map(async (channelId) => {
          await updateDoc(
            doc(db, `workspaces/${agent.wid}/channels/${channelId}`),
            { assignedAgentId: "" }
          );
        })
      );
    }

    // Delete agent
    await deleteDoc(doc(db, `agents/${aid}`));
  };
}

const agentService = new AgentService();
export default agentService;
