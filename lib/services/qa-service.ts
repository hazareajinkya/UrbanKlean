import { doc, getDoc } from "firebase/firestore";
import { db } from "../clients/firebase";
import { IQA } from "../types/qa";

class QAService {
  async getQA(wid: string) {
    try {
      const q = doc(db, `workspaces/${wid}/knowledge/qa`);
      const snap = await getDoc(q);
      if (!snap.exists()) {
        return null;
      }
      return snap.data() as { questions: IQA[] };
    } catch (error) {
      console.error("Error fetching QA: ", error);
      return null;
    }
  }
}
const qaService = new QAService();
export default qaService;
