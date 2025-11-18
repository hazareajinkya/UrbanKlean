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
import { deleteCollection, checkRecentlyActive } from "../utils";
import channelService from "./channel-service";

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
    const snap = await getDoc(doc(db, `agents/${aid}`));
    if (!snap.exists()) return null;
    const agent = snap.data() as IAgent;
    this.updateLastActivity(agent);
    return agent;
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
      throw new Error("Agent not found");
    }
    // delete subcollections
    await Promise.all([
      deleteCollection(`agents/${aid}/sessions`),
      deleteCollection(`agents/${aid}/workflows`),
    ]);

    // Unassign from channels
    if (Array.isArray(agent.channels) && agent.channels.length && agent.wid) {
      const promises = agent.channels.map(async (channelId) => {
        await channelService.unassignAgentFromChannel(
          agent.wid,
          channelId,
          aid
        );
      });
      await Promise.all(promises);
    }
    // Delete agent
    await deleteDoc(doc(db, `agents/${aid}`));
  };

  // Updating last activity of agent and workspace

  updateLastActivity = async (agent: IAgent) => {
    const isRecentlyActive = checkRecentlyActive(agent.lastActivity, 24);
    if (isRecentlyActive) return;
    // Update agent once per day
    await updateDoc(doc(db, `agents/${agent.id}`), {
      lastActivity: new Date().toISOString(),
    });

    // Update workspace every time an agent updates
    await updateDoc(doc(db, `workspaces/${agent.wid}`), {
      lastActivity: new Date().toISOString(),
    });
  };
}

const agentService = new AgentService();
export default agentService;
