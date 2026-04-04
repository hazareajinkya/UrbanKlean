import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  where,
  updateDoc,
  query,
  limit,
} from "firebase/firestore";

import { db } from "../clients/firebase";
import { generateDefaultAgent, IAgent } from "../types/agent";
import workspaceService from "./workspace-service";
import { deleteCollection, checkRecentlyActive } from "../utils";
import channelService from "./channel-service";
import cacheService from "./cache-service";
import { invalidateCache, invalidateCaches } from "../utils/cache-utils";
import { IWorkspace } from "../types/workspace";

class AgentService {
  async createAgent({ wid, name }: { wid: string; name: string }) {
    const workspace = await workspaceService.fetchWorkspace(wid);
    if (!workspace) throw new Error("Workspace not found");
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
    // Try cache first
    const cached = await cacheService.getAgent(aid);
    if (cached) return cached;

    // Cache miss - fetch from Firestore
    const snap = await getDoc(doc(db, `agents/${aid}`));
    if (!snap.exists()) return null;

    const agent = snap.data() as IAgent;

    // Store in cache (fire and forget)
    cacheService.setAgent(aid, agent);

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

    // Invalidate server-side cache via API
    invalidateCache({ type: "agent", id: aid });
  }

  deleteAgent = async ({ aid }: { aid: string }) => {
    // Fetch agent (will use cache if available)
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
          aid,
        );
      });
      await Promise.all(promises);
    }
    // Delete agent
    await deleteDoc(doc(db, `agents/${aid}`));

    // Invalidate server-side cache via API (agent + workflows)
    invalidateCaches([
      { type: "agent", id: aid },
      { type: "workflows", id: aid },
    ]);
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

    // Note: We don't invalidate cache here because lastActivity is not critical
    // and the cache will naturally expire or be invalidated on next real update
  };

  removeFolderFromAgents = async (wid: string, folderId: string) => {
    try {
      const agents = await this.fetchAgents(wid);
      const agentsToUpdate = agents.filter((agent) =>
        agent.knowledgeFolders?.includes(folderId),
      );

      const updatePromises = agentsToUpdate.map((agent) =>
        updateDoc(doc(db, `agents/${agent.id}`), {
          knowledgeFolders: agent.knowledgeFolders.filter(
            (id) => id !== folderId,
          ),
          updatedAt: new Date().toISOString(),
        }),
      );
      await Promise.all(updatePromises);

      // Invalidate server-side cache via API for all updated agents
      invalidateCaches(
        agentsToUpdate.map((agent) => ({
          type: "agent" as const,
          id: agent.id,
        })),
      );
    } catch (error) {
      console.error("Error removing folder from agents:", error);
    }
  };
  fetchAgentUsingOnBoardingEmail = async (email: string) => {
    const workspaceQ = query(
      collection(db, `workspaces`),
      where("info.email", "==", email),
    );
    const workspaces = await getDocs(workspaceQ);
    if (workspaces.empty) return null;
    const workspace = workspaces.docs[0].data() as IWorkspace;
    const agentQ = query(
      collection(db, `agents`),
      where("wid", "==", workspace.id),
      limit(1),
    );
    const agents = await getDocs(agentQ);
    if (agents.empty) return null;
    return agents.docs[0].data() as IAgent;
  };

  subscribeToAgentSnapshot = (args: {
    aid: string;
    onChange: (agent: IAgent | null) => void;
    onError?: (error: Error) => void;
  }) => {
    const ref = doc(db, `agents/${args.aid}`);
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          args.onChange(null);
          return;
        }
        args.onChange(snap.data() as IAgent);
      },
      (error) => {
        args.onError?.(error);
      },
    );
  };
  // nothing
}

const agentService = new AgentService();
export default agentService;
