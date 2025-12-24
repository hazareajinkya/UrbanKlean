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

    // Clear previous state immediately when switching agents
    set({
      history: [],
      persons: {},
      nChats: 0,
      hasMore: true,
      nextQuery: null,
    });

    const q = buildQuery(aid);

    const newUnsubscribe = onSnapshot(q, (snapshot) => {
      const { history, nextQuery } = get();
      const snapshotSessions = snapshot.docs.map(
        (doc) => doc.data() as ISession
      );
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      // Only update the pagination cursor if we are in the initial state
      // (i.e., we haven't paginated yet or the list is small).
      // If we have already paginated deep into history, do NOT reset the cursor based on the real-time "head".
      let newNextQuery = nextQuery;
      if (!nextQuery || history.length <= 15) {
        newNextQuery = buildQuery(aid, true, lastVisible);
      }

      // Merge strategy:
      // 1. Create a map of existing history to preserve loaded items.
      const historyMap = new Map<string, ISession>();

      // Optimization: Avoid creating intermediate arrays for Map constructor
      if (history.length > 0) {
        for (const session of history) {
          historyMap.set(session.id, session);
        }
      }

      // 2. Update or Add sessions from the real-time snapshot.
      snapshotSessions.forEach((session) => {
        historyMap.set(session.id, session);
      });

      // 3. Convert back to array.
      const mergedHistory = Array.from(historyMap.values());

      // 4. Sort by updatedAt desc to ensure correct order after updates.
      // Optimization: Sort using string comparison (ISO dates sort lexicographically)
      mergedHistory.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));

      const personIds = mergedHistory
        .map((session) => session.personId)
        .filter((id) => id !== undefined);
      get().getPersonsInfo(personIds);

      set({
        history: mergedHistory,
        nextQuery: newNextQuery,
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
      person.pastSessionIds = person.pastSessionIds?.reverse() ?? [];
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
    const { nextQuery, history } = get();

    try {
      const first = buildQuery(aid);
      // Fallback to first query if nextQuery is missing for some reason
      const queryToUse = nextQuery ?? first;

      const snaps = await getDocs(queryToUse);

      if (snaps.empty) {
        set({ hasMore: false });
        return;
      }

      const data = snaps.docs.map((doc) => doc.data()) as ISession[];
      const lastVisible = snaps.docs[snaps.docs.length - 1];
      const next = buildQuery(aid, true, lastVisible);

      // Use map merge here too to prevent duplicates if real-time
      // updates shifted the list boundaries.
      const historyMap = new Map<string, ISession>();

      if (history.length > 0) {
        for (const session of history) {
          historyMap.set(session.id, session);
        }
      }

      data.forEach((s) => historyMap.set(s.id, s));

      const updatedHistory = Array.from(historyMap.values()).sort((a, b) =>
        b.updatedAt > a.updatedAt ? 1 : -1
      );

      const personIds = data
        .map((s) => s.personId)
        .filter((id) => id !== undefined);
      get().getPersonsInfo(personIds);

      set({ history: updatedHistory, nextQuery: next });

      const qWithoutLimits = buildQuery(aid, false);
      const snap = await getCountFromServer(qWithoutLimits);
      const { count } = snap.data();

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
        const updatedHistory = [...history, session].sort((a, b) =>
          b.updatedAt > a.updatedAt ? 1 : -1
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
  const lt = limit(15);

  const filters = [];
  if (lastVisible) filters.push(startAfter(lastVisible));

  if (includeLimits) filters.push(lt);
  if (filters.length > 0) {
    return query(ref, fetchOrder, ...filters);
  } else {
    return query(ref, fetchOrder);
  }
};
