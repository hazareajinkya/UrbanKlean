import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../clients/firebase";
import {
  IChatMessage,
  ITraingSession,
  generateDefaultTeachSession,
} from "../types/session";
import { cleanMessageForSaving } from "./chat-service";

class TeachService {
  async createTeachSession(wid: string) {
    const session = generateDefaultTeachSession(wid);
    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/teach/sessions/${wid}`),
      session
    );
    return session;
  }

  async getTeachSession(wid: string) {
    const docRef = doc(db, `workspaces/${wid}/knowledge/teach/sessions/${wid}`);
    const snap = await getDoc(docRef);
    return snap.data() as ITraingSession;
  }

  async saveTeachMessage(wid: string, message: IChatMessage) {
    const ref = doc(db, `workspaces/${wid}/knowledge/teach/sessions/${wid}`);
    const cleanMessage = cleanMessageForSaving(message);
    await updateDoc(ref, {
      messages: arrayUnion(cleanMessage),
      updatedAt: new Date().toISOString(),
    });
  }
}
const teachService = new TeachService();
export default teachService;
