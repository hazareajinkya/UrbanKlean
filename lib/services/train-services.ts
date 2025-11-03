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
import {
  IChatMessage,
  ITraingSession,
  generateDefaultTrainingSession,
} from "../types/session";
import { cleanMessageForSaving } from "./chat-service";

class TrainService {
  async createTrainingSession(wid: string) {
    const session = generateDefaultTrainingSession(wid);
    await setDoc(doc(db, `workspaces/${wid}/sessions/${session.id}`), session);
    return session;
  }

  async createTrainingSessionWithId(wid: string, sid: string) {
    const session = generateDefaultTrainingSession(wid, sid);
    await setDoc(doc(db, `workspaces/${wid}/sessions/${session.id}`), session);
    return session;
  }

  async getTrainingSession(sid: string, wid: string) {
    const docRef = doc(db, `workspaces/${wid}/sessions/${sid}`);
    const snap = await getDoc(docRef);
    return snap.data() as ITraingSession;
  }

  async ensureTrainingSession(wid: string, sid: string) {
    const existing = await this.getTrainingSession(sid, wid);
    if (existing) return existing;
    return this.createTrainingSessionWithId(wid, sid);
  }

  async saveTrainingMessage(wid: string, sid: string, message: IChatMessage) {
    const ref = doc(db, `workspaces/${wid}/sessions/${sid}`);
    const cleanMessage = cleanMessageForSaving(message);

    await updateDoc(ref, {
      messages: arrayUnion(cleanMessage),
      updatedAt: new Date().toISOString(),
    });
  }

  async listTrainingSessions(wid: string) {
    const sessionsRef = collection(db, `workspaces/${wid}/sessions`);
    const q = query(sessionsRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ITraingSession);
  }
}
const trainService = new TrainService();
export default trainService;
