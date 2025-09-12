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

class AgentService {
  async createAgent({ wid, name }: { wid: string; name: string }) {
    const agent = generateDefaultAgent(wid, name);
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

  async deleteAgent({ aid }: { aid: string }) {
    await deleteDoc(doc(db, `agents/${aid}`));
  }
}

const agentService = new AgentService();
export default agentService;
