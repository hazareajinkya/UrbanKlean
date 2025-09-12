import {
  collection,
  DocumentData,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  Query,
  query,
  QuerySnapshot,
  SnapshotMetadata,
  startAfter,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../clients/firebase";
import { ISession } from "../types/session";
import chatService from "../services/chat-service";

export const useHistoryStore = create<IHistoryStore>((set, get) => ({
  nChats: 0,
  hasMore: true,
  history: [],
  nextQuery: null,
  unsubscribe: null,
  setnChats: (nChats: number) => set({ nChats }),
  sethasMore: (hasMore: boolean) => set({ hasMore }),

  getChatsCount: async (q) => {
    const snap = await getCountFromServer(q);
    const { count } = snap.data();
    const { history } = get();

    set({ nChats: count, hasMore: count > history.length });
  },

  subscribeToSessions: (aid: string) => {
    const { unsubscribe } = get();

    if (unsubscribe) {
      unsubscribe();
    }

    const q = buildQuery(aid);

    const newUnsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map((doc) => doc.data() as ISession);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const next = buildQuery(aid, true, lastVisible);
      set({
        history: sessions,
        nextQuery: next,
      });
    });

    const qWithoutLimits = buildQuery(aid, false);
    get().getChatsCount(qWithoutLimits);

    set({ unsubscribe: newUnsubscribe });
  },

  unsubscribeFromSessions: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  fetchNextSessions: async (aid: string) => {
    const { nextQuery } = get();

    try {
      const first = buildQuery(aid);

      const snaps = await getDocs(nextQuery ? nextQuery : first);

      let data = snaps.docs.map((doc) => doc.data()) as ISession[];
      const updatedHistory = [...get().history, ...data];
      set({ history: updatedHistory });

      const qWithoutLimits = buildQuery(aid, false);
      const snap = await getCountFromServer(qWithoutLimits);
      const { count } = snap.data();

      console.log("count: ", count);
      console.log("hasMore: ", count > updatedHistory.length);

      set({ nChats: count, hasMore: count > updatedHistory.length });
    } catch (error) {
      console.log("error: ", error);
    }
  },
}));

export interface IHistoryStore {
  nChats: number;
  hasMore: boolean;
  nextQuery: Query<DocumentData> | null;
  history: ISession[];
  unsubscribe: (() => void) | null;
  setnChats: (nChats: number) => void;
  sethasMore: (hasMore: boolean) => void;
  getChatsCount: (query: Query) => Promise<void>;

  fetchNextSessions: (aid: string) => Promise<void>;

  subscribeToSessions: (aid: string) => void;
  unsubscribeFromSessions: () => void;
}

const buildQuery = (
  aid: string,
  includeLimits = true,
  lastVisible?: any
): Query => {
  const ref = collection(db, `agents/${aid}/sessions`);
  const fetchOrder = orderBy("updatedAt", "desc");
  const lt = limit(10);

  const filters = [];
  if (lastVisible) filters.push(startAfter(lastVisible));

  if (includeLimits) filters.push(lt);
  if (filters.length > 0) {
    return query(ref, fetchOrder, ...filters);
  } else {
    return query(ref, fetchOrder);
  }
};
