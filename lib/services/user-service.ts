import { generateDefaultUser, IUser } from "@/lib/types/user";
import { db } from "../clients/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { DEFAULT_PROFILE_PIC } from "../constants";
import { User } from "firebase/auth";
import storageService from "./storage-service";

class UserService {
  async getUser(email: string) {
    const docRef = doc(db, `users/${email}`);
    const snap = await getDoc(docRef);

    return snap.data() as IUser | undefined;
  }

  async getUsers(emails: string[]): Promise<Map<string, IUser>> {
    if (emails.length === 0) return new Map();

    // Deduplicate emails to avoid redundant queries
    const uniqueEmails = [...new Set(emails)];

    // Firestore 'in' query supports max 30 items, so chunk if needed
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueEmails.length; i += 30) {
      chunks.push(uniqueEmails.slice(i, i + 30));
    }

    const userRef = collection(db, "users");

    const results = await Promise.all(
      chunks.map((chunk) =>
        getDocs(query(userRef, where("email", "in", chunk)))
      )
    );

    const usersMap = new Map<string, IUser>();
    for (const snapshot of results) {
      for (const docSnap of snapshot.docs) {
        usersMap.set(docSnap.id, docSnap.data() as IUser);
      }
    }

    return usersMap;
  }

  async createUser(fbuser: User) {
    const user = generateDefaultUser();
    user.id = fbuser.uid;
    user.name = fbuser.displayName ?? "";
    user.photoUrl = fbuser.photoURL ?? DEFAULT_PROFILE_PIC;
    user.email = fbuser.email ?? "";

    await setDoc(doc(db, `users/${user.email}`), user);
    return user;
  }

  async updateUser(email: string, updates: Partial<IUser>) {
    await updateDoc(doc(db, `users/${email}`), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateUserProfile(
    name: string | undefined,
    file: File | undefined,
    user: IUser
  ) {
    if (!user.email) throw new Error("No authenticated user");
    let photoUrl: string | undefined;
    if (file) {
      if (!user.id) throw new Error("No authenticated user id");
      const path = `users/${user.id}/profile`;
      const upload = await storageService.uploadFile(file, path, file.name);
      photoUrl = upload.downloadURL;
    }
    const updates: { name?: string; photoUrl?: string } = {};
    if (typeof name === "string" && name.trim() !== "")
      updates.name = name.trim();
    if (photoUrl) updates.photoUrl = photoUrl;

    if (Object.keys(updates).length === 0) return true;

    await userService.updateUser(user.email, updates);
    return true;
  }
}

const userService = new UserService();

export default userService;
