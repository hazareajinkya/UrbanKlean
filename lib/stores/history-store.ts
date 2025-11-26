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
import peopleService from "../services/people-service";
import { IPerson } from "../types/person";
import { getwid } from "../utils";

export const useHistoryStore = create<IHistoryStore>((set, get) => ({
  nChats: 0,
  hasMore: true,
  history: [],
  nextQuery: null,
  unsubscribe: null,
  persons: {},
  loadingSessionIds: new Set<string>(),
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

      const personIds = sessions
        .map((session) => session.personId)
        .filter((id) => id !== undefined);
      get().getPersonsInfo(personIds);

      set({
        history: sessions,
        nextQuery: next,
      });
    });

    const qWithoutLimits = buildQuery(aid, false);
    get().getChatsCount(qWithoutLimits);

    set({ unsubscribe: newUnsubscribe });
  },

  getPersonsInfo: async (ids: string[]) => {
    const wid = getwid();

    const people = await peopleService.getPersons(wid, ids);

    const map = people.reduce((acc, person) => {
      person.pastSessionIds = person.pastSessionIds.reverse();
      acc[person.id] = person;

      return acc;
    }, {} as Record<string, IPerson>);

    set({ persons: { ...get().persons, ...map } });
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

      const personIds = data
        .map((session) => session.personId)
        .filter((id) => id !== undefined);
      get().getPersonsInfo(personIds);

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

  fetchAndAddSessionToHistory: async (sessionId: string, aid: string) => {
    const { history, loadingSessionIds } = get();
    // Return early if session already exists in history
    const existingSession = history.find((s) => s.id === sessionId);
    if (existingSession) return;

    // Return early if session is already being fetched
    if (loadingSessionIds.has(sessionId)) return;

    // Mark session as loading to prevent duplicate fetches
    set({
      loadingSessionIds: new Set([...loadingSessionIds, sessionId]),
    });

    try {
      // Fetch session from Firestore
      const session = await chatService.getSession(sessionId, aid);
      if (session) {
        // Add to history and sort by updatedAt (newest first)
        const updatedHistory = [...history, session].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        set({ history: updatedHistory });

        // Fetch person info if session has a personId
        if (session.personId) {
          get().getPersonsInfo([session.personId]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
    } finally {
      // Remove session from loading set
      const { loadingSessionIds: currentLoading } = get();
      const updated = new Set(currentLoading);
      updated.delete(sessionId);
      set({ loadingSessionIds: updated });
    }
  },
}));

export interface IHistoryStore {
  nChats: number;
  hasMore: boolean;
  nextQuery: Query<DocumentData> | null;
  history: ISession[];
  persons: Record<string, IPerson>;
  unsubscribe: (() => void) | null;
  loadingSessionIds: Set<string>;
  setnChats: (nChats: number) => void;
  sethasMore: (hasMore: boolean) => void;
  getChatsCount: (query: Query) => Promise<void>;

  getPersonsInfo: (ids: string[]) => Promise<void>;
  fetchNextSessions: (aid: string) => Promise<void>;
  fetchAndAddSessionToHistory: (
    sessionId: string,
    aid: string
  ) => Promise<void>;

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
  const lt = limit(11);

  const filters = [];
  if (lastVisible) filters.push(startAfter(lastVisible));

  if (includeLimits) filters.push(lt);
  if (filters.length > 0) {
    return query(ref, fetchOrder, ...filters);
  } else {
    return query(ref, fetchOrder);
  }
};
