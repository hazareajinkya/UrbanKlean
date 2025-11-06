import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../clients/firebase";
import {
  IChatMessage,
  ITraingSession,
  generateDefaultTeachSession,
} from "../types/session";
import { cleanMessageForSaving } from "./chat-service";
import { saveTeachLocalSession } from "@/components/chat/chat-utils";

class TeachService {
  async createTeachSession(wid: string) {
    const session = generateDefaultTeachSession(wid);
    saveTeachLocalSession(wid, session.id);
    await setDoc(
      doc(db, `workspaces/${wid}/knowledge/teach/sessions/${session.id}`),
      session
    );
    return session;
  }

  async getTeachSession(wid: string, sid: string) {
    const docRef = doc(db, `workspaces/${wid}/knowledge/teach/sessions/${sid}`);
    const snap = await getDoc(docRef);
    return snap.data() as ITraingSession;
  }

  async saveTeachMessage(wid: string, sid: string, message: IChatMessage) {
    const ref = doc(db, `workspaces/${wid}/knowledge/teach/sessions/${sid}`);
    const cleanMessage = cleanMessageForSaving(message);
    await updateDoc(ref, {
      messages: arrayUnion(cleanMessage),
      updatedAt: new Date().toISOString(),
    });
  }
}
const teachService = new TeachService();
export default teachService;
