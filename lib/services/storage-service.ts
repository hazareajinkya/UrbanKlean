import {
  deleteObject,
  getDownloadURL,
  ref,
  StorageReference,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../clients/firebase";

class StorageService {
  async uploadFile(file: File, storageRef: string, fileName: string) {
    const sref = ref(storage, storageRef);
    const snapshot = await uploadBytesResumable(sref, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      downloadURL,
      metadata: {
        name: fileName,
        fullPath: snapshot.ref.fullPath,
        size: snapshot.totalBytes,
        contentType: file.type,
        timeCreated: new Date().toISOString(),
      },
    };
  }

  async uploadBuffer(
    buffer: ArrayBuffer | Uint8Array,
    storageRef: string,
    contentType: string
  ) {
    const sref = ref(storage, storageRef);
    const metadata = {
      contentType: contentType,
    };
    const snapshot = await uploadBytes(sref, buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      downloadURL,
      metadata: {
        name: snapshot.ref.name,
        fullPath: snapshot.ref.fullPath,
        size: snapshot.metadata.size,
        contentType: contentType,
        timeCreated: new Date().toISOString(),
      },
    };
  }

  async deleteStoredFile(storageRef: string) {
    const sref = ref(storage, storageRef);
    await deleteObject(sref);
  }

  async deleteFile(downloadURL: string) {
    // Extract storage reference from download URL
    const url = new URL(downloadURL);
    console.log("url: ", url);

    const pathMatch = url.pathname.match(/\/o\/(.+)$/);
    console.log("pathMatch: ", pathMatch);

    if (pathMatch) {
      const storagePath = decodeURIComponent(pathMatch[1]);
      console.log("storagePath: ", storagePath);

      await this.deleteStoredFile(storagePath);
    }
  }

  async uploadB(ref: any, arrayBuffer: ArrayBuffer, metadata: any) {
    await uploadBytes(ref, arrayBuffer, metadata);

    return await getDownloadURL(ref);
  }
}

const storageService = new StorageService();

export default storageService;
