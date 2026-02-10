import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  generateDefaultSession,
  IChatMessage,
  ISession,
} from "../types/session";
import { db } from "../clients/firebase";
import { UIDataTypes, UIMessagePart, UITools } from "ai";
import { IChannelProvider } from "../types/channel";
import {
  getLocalDeviceId,
  saveLocalSession,
} from "../../components/chat/chat-utils";
import peopleService from "./people-service";
import { Geo } from "@vercel/functions";

class ChatService {
  async createSession(
    wid: string,
    aid: string,
    personId?: string,
    sessionId?: string,
    providerId?: string,
    fromPage?: string,
    geo?: Geo,
  ) {
    const session = generateDefaultSession(
      wid,
      aid,
      "web",
      providerId,
      sessionId,
      fromPage,
    );

    if (geo) session.geo = geo;
    if (personId) {
      session.personId = personId;
      if (geo) {
        const location = [geo.city, geo.country].filter(Boolean).join(", ");
        peopleService.update({
          wid: wid,
          personId: personId,
          updates: { location },
        });
      }
      peopleService.updatePastSessionIds({
        wid,
        personId,
        sessionId: session.id,
        aid,
      });
    }

    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);

    return session;
  }

  async updateSession(aid: string, sid: string, updates: Partial<ISession>) {
    const ref = doc(db, `agents/${aid}/sessions/${sid}`);
    const session = updates.personId ? await this.getSession(sid, aid) : null;

    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // Update pastSessionIds if personId changed
    if (
      updates.personId &&
      session?.wid &&
      session?.personId !== updates.personId
    ) {
      await peopleService.updatePastSessionIds({
        wid: session.wid,
        personId: updates.personId,
        sessionId: sid,
        aid,
      });
    }
  }

  async ensureSession(
    wid: string,
    aid: string,
    sid: string,
    personId?: string,
    providerId?: string,
    fromPage?: string,
    geo?: Geo,
  ) {
    let session = await this.getSession(sid, aid);

    if (!session) {
      // Session doesn't exist, create it
      const geoDetails = geo?.country ? geo : undefined;
      session = await this.createSession(
        wid,
        aid,
        personId,
        sid,
        providerId,
        fromPage,
        geoDetails,
      );
    } else if (personId && session.personId !== personId) {
      // Session exists but personId changed or being added, update it
      await this.updateSession(aid, sid, { personId });
      session.personId = personId;
    }

    return session;
  }

  async createWASession(
    wid: string,
    aid: string,
    waPhoneId: string,
    personId: string,
    provider: IChannelProvider,
  ) {
    const session = generateDefaultSession(wid, aid, provider, waPhoneId);
    session.personId = personId;
    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }
  async getSessionByProviderId(pid: string, aid: string) {
    const ref = collection(db, `agents/${aid}/sessions`);
    const q = query(
      ref,
      where("providerId", "==", pid),
      where("status", "==", "open"),
      orderBy("updatedAt", "desc"),
      limit(1),
    );
    const snap = await getDocs(q);
    return snap.docs[0]?.data() as ISession;
  }

  async getSessionsByFilter({
    aid,
    sid,
    status = "all",
    nLimit = 50,
    providerId,
    personId,
  }: {
    aid: string;
    sid: string;
    status?: "open" | "closed" | "all";
    nLimit?: number;
    providerId?: string;
    personId?: string;
  }) {
    const colRef = collection(db, `agents/${aid}/sessions`);

    const filters = [];
    const fetchOrder = orderBy("updatedAt", "desc");
    const lt = limit(nLimit);
    if (sid) filters.push(where("id", "==", sid));
    if (status !== "all") filters.push(where("status", "==", status));
    if (providerId) filters.push(where("providerId", "==", providerId));
    if (personId) filters.push(where("personId", "==", personId));
    const q = query(colRef, ...filters, fetchOrder, lt);
    const snap = await getDocs(q);

    return snap.docs.map((doc) => doc.data() as ISession) ?? [];
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
    callback: (sessions: ISession[]) => void,
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
    channel: IChannelProvider,
  ) {
    const session = generateDefaultSession(wid, aid, channel, sessionId);
    session.personId = personId;
    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }
  async createInstaSession(
    wid: string,
    aid: string,
    instaUserId: string,
    personId: string,
    provider: IChannelProvider,
  ) {
    const session = generateDefaultSession(wid, aid, provider, instaUserId);
    session.personId = personId;
    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }
  async createMessengerSession(
    wid: string,
    aid: string,
    messengerUserId: string,
    personId: string,
    provider: IChannelProvider,
  ) {
    const session = generateDefaultSession(wid, aid, provider, messengerUserId);
    session.personId = personId;
    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }
  async createPostmarkSession(
    wid: string,
    aid: string,
    providerId: string,
    personId: string,
    provider: IChannelProvider,
  ) {
    const session = generateDefaultSession(wid, aid, provider, providerId);
    session.personId = personId;
    await setDoc(doc(db, `agents/${aid}/sessions/${session.id}`), session);
    return session;
  }
}

const chatService = new ChatService();
export default chatService;

const isEmpty = (v: unknown): boolean =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

const removeEmpty = (obj: any): any => {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) {
    const cleaned = obj.map(removeEmpty).filter((v) => !isEmpty(v));
    return cleaned.length ? cleaned : undefined;
  }
  if (typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const cleaned = removeEmpty(v);
      if (!isEmpty(cleaned)) result[k] = cleaned;
    }
    return Object.keys(result).length ? result : undefined;
  }
  return obj;
};

export const cleanMessageForSaving = (message: IChatMessage) => {
  const cleaned = removeEmpty(message) as IChatMessage;
  if (!cleaned?.parts?.length) return cleaned;

  cleaned.parts = cleaned.parts
    .map((part) => {
      if (part.type?.startsWith("data-"))
        return { ...part, type: "data-data" } as { type: "data-data"; id?: string; data: any };
      return part;
    })
    .filter((p) => (p as any).type && ((p as any).type !== "text" || (p as any).text)) as UIMessagePart<
    { type: "data"; data: any },
    UITools
  >[];
  if (!cleaned.parts.length) {
    const { parts: _, ...rest } = cleaned;
    return rest as IChatMessage;
  }
  return cleaned;
};
