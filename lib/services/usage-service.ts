import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../clients/firebase";
import { IUsage } from "../types/usage";

class UsageService {
  async addUsage(userId: string, usage: IUsage) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const dateKey = `${day}-${month}-${year}`;
    const usageRef = doc(db, `users/${userId}/usage/${dateKey}`);
    try {
      await updateDoc(usageRef, {
        events: arrayUnion(usage),
      });
    } catch (error: any) {
      if (error.code === "not-found") {
        await setDoc(usageRef, {
          events: [usage],
        });
      } else {
        console.error("Error adding usage: ", error);
        throw error;
      }
    }
  }
}

export const usageService = new UsageService();

export default usageService;
