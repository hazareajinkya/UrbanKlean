import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { IUsage } from "../types/usage";
import workspaceService from "./workspace-service";

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

  async getUsage(wid: string) {
    try {
      const workspace = await workspaceService.fetchWorkspace(wid);
      if (!workspace || !workspace.ownerId) {
        throw new Error("Workspace not found or has no owner");
      }

      const ownerId = workspace.ownerId;
      const usageCollection = query(
        collection(db, `users/${ownerId}/usage`),
        limit(2)
      );
      const snapshot = await getDocs(usageCollection);
      const allUsageEvents: IUsage[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.events && Array.isArray(data.events)) {
          const filteredEvents = data.events.filter(
            (event: IUsage) => event.wid === wid
          );
          allUsageEvents.push(...filteredEvents);
        }
      });

      return allUsageEvents;
    } catch (error) {
      console.error("Error getting usage: ", error);
      throw error;
    }
  }
}

export const usageService = new UsageService();

export default usageService;
