import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { generateDefaultFolder, IFolder } from "../types/folder";
import { deleteCollection } from "../utils";
import knowledgeService from "./knowledge-service";
import agentService from "./agent-service";

class FolderService {
  async createFolder(wid: string, name: string) {
    const folder = generateDefaultFolder(wid, name);
    await setDoc(doc(db, `workspaces/${wid}/folders/${folder.id}`), folder);

    await updateDoc(doc(db, `workspaces/${wid}`), {
      folders: arrayUnion({ id: folder.id, name: folder.name }),
    });

    return folder;
  }

  async getFolders(wid: string) {
    const colRef = collection(db, `workspaces/${wid}/folders`);
    const q = query(colRef, orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as IFolder);
  }

  async getFolder(wid: string, folderId: string) {
    const docRef = doc(db, `workspaces/${wid}/folders/${folderId}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as IFolder;
  }

  async updateFolder(
    wid: string,
    folderId: string,
    updates: Partial<Pick<IFolder, "name">>
  ) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}`),
      updateData
    );

    if (updates.name) {
      const wsRef = doc(db, `workspaces/${wid}`);
      const wsSnap = await getDoc(wsRef);

      if (wsSnap.exists()) {
        const wsData = wsSnap.data();
        const folders = wsData.folders || [];

        const updatedFolders = folders.map((f: any) => {
          if (f.id === folderId) {
            return { ...f, name: updates.name };
          }
          return f;
        });

        await updateDoc(wsRef, { folders: updatedFolders });
      }
    }
  }

  async deleteFolder(wid: string, folderId: string) {
    try {
      await knowledgeService.deleteAllKnowledgeInFolder(wid, folderId);
    } catch (e) {
      console.error("Failed to delete Qdrant knowledge");
      throw e;
    }

    await agentService.removeFolderFromAgents(wid, folderId);

    // Delete all subcollections
    const subCollections = [
      `workspaces/${wid}/folders/${folderId}/documents`,
      `workspaces/${wid}/folders/${folderId}/websites`,
      `workspaces/${wid}/folders/${folderId}/texts`,
      `workspaces/${wid}/folders/${folderId}/teach`,
    ];

    await Promise.all(subCollections.map((path) => deleteCollection(path)));

    const folder = await this.getFolder(wid, folderId);
    if (folder) {
      await updateDoc(doc(db, `workspaces/${wid}`), {
        folders: arrayRemove({ id: folder.id, name: folder.name }),
      });
    }

    await deleteDoc(doc(db, `workspaces/${wid}/folders/${folderId}`));
  }

  async getOrCreateMiscellaneousFolder(wid: string): Promise<IFolder> {
    const colRef = collection(db, `workspaces/${wid}/folders`);
    const q = query(colRef, where("name", "==", "Miscellaneous"));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs[0].data() as IFolder;
    }

    return this.createFolder(wid, "Miscellaneous");
  }
}

const folderService = new FolderService();
export default folderService;
