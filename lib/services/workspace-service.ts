import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import {
  generateDefaultWorkspace,
  IWorkspace,
  IWorkspaceInfo,
  emailSubscriptionType,
} from "../types/workspace";
import { IPlanId } from "../types/user";
import userService from "./user-service";
import agentService from "./agent-service";
import { axiosClient } from "../clients/axios-client";
import { deleteCollection } from "../utils";
import memberService from "./member-service";
import { IAgent } from "../types/agent";
import knowledgeService from "./knowledge-service";
import folderService from "./folder-service";
import { canCreateWorkspace } from "../utils/permissions";

class WorkspaceService {
  async fetchWorkspaces(ids: string[]) {
    if (ids.length === 0) return [];

    const q = query(collection(db, "workspaces"), where("id", "in", ids));
    const workspaces = await getDocs(q);
    return workspaces.docs.map((doc) => doc.data()) as IWorkspace[];
  }

  async fetchWorkspace(id: string) {
    const docRef = doc(db, `workspaces/${id}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as IWorkspace;
  }

  async syncOwnerWorkspacesPlan({
    ownerId,
    planId,
  }: {
    ownerId: string;
    planId: IPlanId;
  }) {
    if (!ownerId) return;
    const q = query(
      collection(db, "workspaces"),
      where("ownerId", "==", ownerId),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const updatedAt = new Date().toISOString();
    await Promise.all(
      snapshot.docs.map((docSnap) =>
        updateDoc(doc(db, `workspaces/${docSnap.id}`), {
          planId,
          updatedAt,
        }),
      ),
    );
  }

  async createWorkspace({
    name,
    description,
    ownerId,
    info,
    domains,
  }: {
    name: string;
    description: string;
    ownerId: string;
    info?: IWorkspaceInfo;
    domains: string[];
  }) {
    const user = await userService.getUser(ownerId);
    if (!canCreateWorkspace(user?.subscription?.planId)) {
      throw new Error("You don't have an active plan to create a workspace");
    }
    const workspace = generateDefaultWorkspace();
    const wid = workspace.id;
    workspace.name = name;
    workspace.oneLiner = description;
    workspace.ownerId = ownerId;
    workspace.domains = domains;
    workspace.planId = user?.subscription?.planId || "none";
    if (info) {
      workspace.info = info;
    }
    //create workspace
    await setDoc(doc(db, `workspaces/${wid}`), workspace);
    //add user as owner
    await setDoc(doc(db, `workspaces/${wid}/members/${ownerId}`), {
      status: "accepted",
      role: "owner",
      email: ownerId,
    });
    //also add in users collection
    await updateDoc(doc(db, `users/${ownerId}`), {
      workspaces: arrayUnion({ id: wid, name: name, role: "owner" }),
      updatedAt: new Date().toISOString(),
    });

    await folderService.getOrCreateMiscellaneousFolder(wid);

    return workspace;
  }

  async updateWorkspace({
    wid,
    updates,
  }: {
    wid: string;
    updates: Partial<IWorkspace>;
  }) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, `workspaces/${wid}`), updateData);

    if (updates.name) {
      const members = await getDocs(
        query(collection(db, `workspaces/${wid}/members`)),
      );

      for (const memberDoc of members.docs) {
        const memberEmail = memberDoc.id;
        const user = await userService.getUser(memberEmail);

        if (user) {
          const userData = user;
          const workspaces = userData.workspaces || [];
          const updatedWorkspaces = workspaces.map((ws: any) =>
            ws.id === wid ? { ...ws, name: updates.name } : ws,
          );

          await userService.updateUser(memberEmail, {
            workspaces: updatedWorkspaces,
          });
        }
      }
    }
  }

  async updateEmailInsightSubscriptions({
    wid,
    insightType,
    memberEmail,
    enabled,
  }: {
    wid: string;
    insightType: emailSubscriptionType;
    memberEmail: string;
    enabled: boolean;
  }) {
    const workspaceRef = doc(db, `workspaces/${wid}`);
    const memberRef = doc(db, `workspaces/${wid}/members/${memberEmail}`);
    const updatedAt = new Date().toISOString();

    await runTransaction(db, async (transaction) => {
      const workspaceSnap = await transaction.get(workspaceRef);
      if (!workspaceSnap.exists()) {
        throw new Error("Workspace not found");
      }

      const workspaceData = workspaceSnap.data() as IWorkspace & {
        emailInsightSubscriptions?: Partial<
          Record<emailSubscriptionType, string[]>
        >;
      };

      const mergedSubscriptions =
        workspaceData.emailSubscriptions ??
        workspaceData.emailInsightSubscriptions ??
        {};

      const currentMembers = mergedSubscriptions[insightType] ?? [];
      const nextMembers = enabled
        ? Array.from(new Set([...currentMembers, memberEmail]))
        : currentMembers.filter((email) => email !== memberEmail);

      const nextEmailSubscriptions = {
        ...mergedSubscriptions,
        [insightType]: nextMembers,
      };

      transaction.update(workspaceRef, {
        emailSubscriptions: nextEmailSubscriptions,
        emailInsightSubscriptions: deleteField(),
        updatedAt,
      });

      const memberSnap = await transaction.get(memberRef);
      const existingMemberSubscriptions =
        (memberSnap.data()?.insightSubscriptions as emailSubscriptionType[]) ??
        [];

      const nextMemberSubscriptions = enabled
        ? Array.from(new Set([...existingMemberSubscriptions, insightType]))
        : existingMemberSubscriptions.filter(
            (subscription) => subscription !== insightType,
          );

      transaction.set(
        memberRef,
        { insightSubscriptions: nextMemberSubscriptions },
        { merge: true },
      );
    });
  }

  async addDomainToWorkspace({ wid, domain }: { wid: string; domain: string }) {
    await updateDoc(doc(db, `workspaces/${wid}`), {
      domains: arrayUnion(domain),
      updatedAt: new Date().toISOString(),
    });
  }

  async removeDomainFromWorkspace({
    wid,
    domain,
  }: {
    wid: string;
    domain: string;
  }) {
    await updateDoc(doc(db, `workspaces/${wid}`), {
      domains: arrayRemove(domain),
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteWorkspace({ wid }: { wid: string }) {
    try {
      // Delete workspace members
      try {
        const members = await memberService.fetchMembers(wid);
        if (members?.length) {
          const promises = members.map((member) =>
            memberService.removeMember({ wid, email: member.email }),
          );
          await Promise.all(promises);
        }
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete members:`, error);
        throw new Error("Failed to delete members.");
      }

      // Delete workspace agent
      try {
        const agents = await agentService.fetchAgents(wid);
        if (agents?.length) {
          const promises = agents.map((agent: IAgent) =>
            agentService.deleteAgent({ aid: agent.id! }),
          );
          await Promise.all(promises);
        }
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete agents:`, error);
        throw new Error("Failed to delete agents.");
      }
      try {
        // Delete workspace knowledge
        await Promise.all([
          knowledgeService.deleteAllTextKnowledge(wid),
          knowledgeService.deleteAllPdfKnowledge(wid),
          knowledgeService.deleteAllWebKnowledge(wid),
          knowledgeService.deleteAllTeachKnowledge(wid),
        ]);
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete knowledge:`, error);
        throw new Error("Failed to delete knowledge.");
      }

      try {
        // Delete workspace teach sessions
        await deleteDoc(
          doc(db, `workspaces/${wid}/knowledge/teach/sessions/${wid}`),
        );
      } catch (error) {
        console.error(` Failed to delete teaching session:`, error);
        throw new Error("Failed to delete teaching session.");
      }

      // Delete workspace analytics
      try {
        await deleteCollection(`workspaces/${wid}/analytics`);
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete analytics:`, error);
        throw new Error("Failed to delete analytics.");
      }

      // Delete Qdrant collection
      try {
        await axiosClient.delete(`/api/embeddings/${wid}/qdrant-delete`);
      } catch (error) {
        console.error(`[WorkspaceService] Failed to delete Qdrant:`, error);
        throw new Error("Failed to delete Qdrant collection.");
      }

      // Delete web knowledge collection
      await deleteCollection(`workspaces/${wid}/knowledge/web/default`);

      // Delete folder subcollections before deleting folders
      try {
        const folders = await folderService.getFolders(wid);
        for (const folder of folders) {
          const folderSubcollections = [
            `workspaces/${wid}/folders/${folder.id}/documents`,
            `workspaces/${wid}/folders/${folder.id}/websites`,
            `workspaces/${wid}/folders/${folder.id}/texts`,
            `workspaces/${wid}/folders/${folder.id}/teach`,
          ];
          await Promise.all(
            folderSubcollections.map((path) => deleteCollection(path)),
          );
        }
      } catch (error) {
        console.error(
          `[WorkspaceService] Failed to delete folder subcollections:`,
          error,
        );
      }

      // Delete folders collection
      await deleteCollection(`workspaces/${wid}/folders`);

      // Delete subcollections
      const subCollections = [
        `workspaces/${wid}/channels`,
        `workspaces/${wid}/actions`,
        `workspaces/${wid}/people`,
        `workspaces/${wid}/knowledge/teach/contents`,
        `workspaces/${wid}/knowledge/teach/sessions`,
        `workspaces/${wid}/knowledge`,
        `workspaces/${wid}/members`,
        `workspaces/${wid}/analytics`,
      ];

      await Promise.all(subCollections.map((path) => deleteCollection(path)));
      await deleteDoc(doc(db, `workspaces/${wid}/knowledge/teach`));

      //  Delete document
      await deleteDoc(doc(db, `workspaces/${wid}`));
    } catch (error: any) {
      console.error(
        `[WorkspaceService] Failed to delete workspace ${wid}:`,
        error,
      );
      throw new Error(`Failed to delete workspace: ${error?.message || error}`);
    }
  }

  async addMember(
    wid: string,
    userEmail: string,
    role: "owner" | "admin" | "member" = "member",
    status: "invite" | "accepted" | "default" = "default",
  ) {
    const data = {
      status: status,
      role: role,
      email: userEmail,
    };

    await setDoc(doc(db, `workspaces/${wid}/members/${userEmail}`), data);
  }

  async generateWorkspaceInfo({ wid, url }: { wid: string; url: string }) {
    console.log("Generating workspace info for", wid, url);
    const { data } = await axiosClient.post("/api/workspace/generate-info", {
      wid,
      url,
    });
    return data;
  }

  async initWorkspaceTraining({ wid, url }: { wid: string; url: string }) {
    const { data } = await axiosClient.post("/api/workspace/init-training", {
      wid,
      url,
    });
    if (!data?.success) {
      throw new Error(data?.error?.message || "Failed to init training");
    }
    return data.data as {
      mainUrls: string[];
      mappedUrlsCount: number;
      trainingUrlsCount: number;
    };
  }
}

const workspaceService = new WorkspaceService();
export default workspaceService;
