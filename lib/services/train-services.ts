import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { v4 } from "uuid";
import {
  IChatMessage,
  ITraingSession,
  generateDefaultTrainingSession,
} from "../types/session";
import { cleanMessageForSaving } from "./chat-service";

class TrainService {
  async createTrainingSession(wid: string) {
    const session = generateDefaultTrainingSession(wid);
    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/train/sessions/${session.id}`),
      session
    );
    return session;
  }

  async getTrainingSession(sid: string, wid: string) {
    const docRef = doc(db, `workspaces/${wid}/knowledge/train/sessions/${sid}`);
    const snap = await getDoc(docRef);
    return snap.data() as ITraingSession;
  }

  async saveTrainingMessage(wid: string, sid: string, message: IChatMessage) {
    const ref = doc(db, `workspaces/${wid}/knowledge/train/sessions/${sid}`);
    const cleanMessage = cleanMessageForSaving(message);
    await updateDoc(ref, {
      messages: arrayUnion(cleanMessage),
      updatedAt: new Date().toISOString(),
    });
  }
  async updateTrainedContent(wid: string, title: string, description: string) {
    const ref = doc(db, `workspaces/${wid}/knowledge/train`);
    const item = { id: v4(), title, description };
    await setDoc(
      ref,
      {
        content: arrayUnion(item),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  async getTrainedContent(
    wid: string
  ): Promise<Array<{ id: string; title: string; description: string }>> {
    const ref = doc(db, `workspaces/${wid}/knowledge/train`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const data = snap.data() as {
      content?: Array<{ id: string; title: string; description: string }>;
    };
    return Array.isArray(data?.content) ? data.content : [];
  }
}
const trainService = new TrainService();
export default trainService;
