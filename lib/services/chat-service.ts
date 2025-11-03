import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  generateDefaultSession,
  IChatMessage,
  ISession,
} from "../types/session";
import { db } from "../clients/firebase";
import { UIDataTypes, UIMessagePart, UITools } from "ai";
import { saveLocalSession } from "@/components/chat/chat-utils";
import { IChannelProvider } from "../types/channel";

class ChatService {
  async createSession(wid: string, aid: string) {
    const session = generateDefaultSession(wid, aid, "web");
    saveLocalSession(aid, session.id);

    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }

  async createWASession(
    wid: string,
    aid: string,
    waPhoneId: string,
    personId: string,
    provider: IChannelProvider
  ) {
    const session = generateDefaultSession(wid, aid, provider, waPhoneId);
    session.personId = personId;
    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }

  async getSession(sid: string, aid: string) {
    const docRef = doc(db, `agents/${aid}/sessions/${sid}`);
    const snap = await getDoc(docRef);
    return snap.data() as ISession;
  }

  async saveMessage(aid: string, sid: string, message: IChatMessage) {
    const ref = doc(db, `agents/${aid}/sessions/${sid}`);
    const cleanMessage = cleanMessageForSaving(message);

    await updateDoc(ref, {
      messages: arrayUnion(cleanMessage),
      updatedAt: new Date().toISOString(),
    });
  }

  subscribeToAgentSessions(
    aid: string,
    callback: (sessions: ISession[]) => void
  ) {
    const ref = collection(db, `agents/${aid}/sessions`);
    const q = query(ref, orderBy("updatedAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((doc) => doc.data() as ISession));
    });
    return unsubscribe;
  }

  async createSlackSession(
    wid: string,
    aid: string,
    sessionId: string,
    personId: string,
    channel: IChannelProvider
  ) {
    const session = generateDefaultSession(wid, aid, channel, sessionId);
    session.personId = personId;
    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }
}

const chatService = new ChatService();
export default chatService;

export const cleanMessageForSaving = (message: IChatMessage) => {
  // Remove undefined fields from message before saving
  const cleanMessage = Object.fromEntries(
    Object.entries(message).filter(([_, value]) => value !== undefined)
  ) as IChatMessage;

  // Clean the parts array if it exists
  if (cleanMessage.parts) {
    const parts = cleanMessage.parts
      .map((part) => {
        return Object.fromEntries(
          Object.entries(part).filter(([_, value]) => value !== undefined)
        );
      })
      .filter((part) => Object.keys(part).length > 0); // Remove empty parts

    cleanMessage.parts = parts as UIMessagePart<UIDataTypes, UITools>[];
  }

  return cleanMessage;
};
