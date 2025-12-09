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
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { generateDefaultFolder, IFolder } from "../types/folder";
import { deleteCollection } from "../utils";

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
        const updatedFolders = folders.map((f: any) =>
          f.id === folderId ? { ...f, name: updates.name } : f
        );
        await updateDoc(wsRef, { folders: updatedFolders });
      }
    }
  }

  async deleteFolder(wid: string, folderId: string) {
    // Delete all subcollections
    const subCollections = [
      `workspaces/${wid}/folders/${folderId}/documents`,
      `workspaces/${wid}/folders/${folderId}/websites`,
      `workspaces/${wid}/folders/${folderId}/texts`,
      `workspaces/${wid}/folders/${folderId}/teach`,
    ];

    await Promise.all(subCollections.map((path) => deleteCollection(path)));

    // Get folder name for removing from workspace
    const folder = await this.getFolder(wid, folderId);
    if (folder) {
      await updateDoc(doc(db, `workspaces/${wid}`), {
        folders: arrayRemove({ id: folder.id, name: folder.name }),
      });
    }

    // Delete folder document
    await deleteDoc(doc(db, `workspaces/${wid}/folders/${folderId}`));
  }

  async updateFolderItemCount(
    wid: string,
    folderId: string,
    type: "documents" | "websites" | "texts" | "teach",
    delta: number
  ): Promise<void> {
    const folderRef = doc(db, `workspaces/${wid}/folders/${folderId}`);
    const folder = await this.getFolder(wid, folderId);
    if (!folder) return;

    const newCount = Math.max(0, folder.itemCount[type] + delta);
    const newTotal =
      folder.itemCount.documents +
      folder.itemCount.websites +
      folder.itemCount.texts +
      folder.itemCount.teach +
      delta;

    await updateDoc(folderRef, {
      [`itemCount.${type}`]: newCount,
      "itemCount.total": Math.max(0, newTotal),
      updatedAt: new Date().toISOString(),
    });
  }

  async createMiscellaneousFolder(wid: string): Promise<IFolder> {
    return this.createFolder(wid, "Miscellaneous");
  }
}

const folderService = new FolderService();
export default folderService;
