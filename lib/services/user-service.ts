import { generateDefaultUser, IUser } from "@/lib/types/user";
import { db } from "../clients/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { DEFAULT_PROFILE_PIC } from "../constants";
import { User } from "firebase/auth";

class UserService {
  async getUser(email: string) {
    const docRef = doc(db, `users/${email}`);
    const snap = await getDoc(docRef);

    console.log("getting user info: ");

    return snap.data() as IUser | undefined;
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
      updateAt: new Date().toISOString(),
    });
  }
}

const userService = new UserService();

export default userService;
