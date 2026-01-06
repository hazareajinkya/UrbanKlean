import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
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
          createdAt: new Date().toISOString(),
        });
      } else {
        console.error("Error adding usage: ", error);
        throw error;
      }
    }
  }

  async getGlobalUsage(email: string, dateRange?: { from?: Date; to?: Date }) {
    if (!email) return [];
    try {
      if (dateRange?.from) {
        const dates: Date[] = [];
        const current = new Date(dateRange.from);
        const end = dateRange.to
          ? new Date(dateRange.to)
          : new Date(dateRange.from);

        // Reset time part to compare dates correctly
        current.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        while (current <= end) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }

        const promises = dates.map((date) => {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          const dateKey = `${day}-${month}-${year}`;
          return getDoc(doc(db, `users/${email}/usage/${dateKey}`));
        });

        const snapshots = await Promise.all(promises);
        const usageEvents: IUsage[] = [];
        snapshots.forEach((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as { events: IUsage[] };
            usageEvents.push(...(data.events || []));
          }
        });
        return usageEvents.reverse();
      }

      const usageCollection = query(
        collection(db, `users/${email}/usage`),
        limit(5)
      );
      const snapshot = await getDocs(usageCollection);
      const data = snapshot.docs.map(
        (doc) => doc.data() as { createdAt: string; events: IUsage[] }
      );
      const usageEvents: IUsage[] = [];
      data.forEach((event) => {
        usageEvents.push(...event.events);
      });
      return usageEvents;
    } catch (error) {
      console.error("Error getting global usage: ", error);
      throw error;
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
        orderBy("createdAt", "desc"),
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
