import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { IAnalytics, IWorkspaceAnalyticsSummary } from "../types/analytics";

class AnalyticsService {
  async getLast7DaysAnalytics(wid: string): Promise<IAnalytics[]> {
    const analyticsRef = collection(db, `workspaces/${wid}/analytics`);
    const q = query(analyticsRef, orderBy("createdAt", "desc"), limit(7));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as IAnalytics);
  }
  async getWorkspaceAnalyticsSummary(
    wid: string
  ): Promise<IWorkspaceAnalyticsSummary | null> {
    const workspaceRef = doc(db, `workspaces/${wid}`);
    const snapshot = await getDoc(workspaceRef);

    if (!snapshot.exists()) {
      return null;
    }

    const workspaceData = snapshot.data();
    return (workspaceData?.analytics as IWorkspaceAnalyticsSummary) ?? null;
  }

  async getAnalyticsData(wid: string): Promise<{
    dailyAnalytics: IAnalytics[];
    summary: IWorkspaceAnalyticsSummary | null;
  }> {
    const [dailyAnalytics, summary] = await Promise.all([
      this.getLast7DaysAnalytics(wid),
      this.getWorkspaceAnalyticsSummary(wid),
    ]);

    return {
      dailyAnalytics,
      summary,
    };
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
