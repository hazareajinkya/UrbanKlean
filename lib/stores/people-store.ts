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
  startAfter,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../clients/firebase";
import { IPerson } from "../types/person";

export interface IPeopleStore {
  nPeople: number;
  hasMore: boolean;
  nextQuery: Query<DocumentData> | null;
  people: IPerson[];
  unsubscribe: (() => void) | null;
  loadingPersonIds: Set<string>;

  setNPeople: (nPeople: number) => void;
  setHasMore: (hasMore: boolean) => void;

  getPeopleCount: (query: Query) => Promise<void>;

  fetchNextPeople: (wid: string) => Promise<void>;

  subscribeToPeople: (wid: string) => void;
  unsubscribeFromPeople: () => void;
}

export const usePeopleStore = create<IPeopleStore>((set, get) => ({
  nPeople: 0,
  hasMore: true,
  people: [],
  nextQuery: null,
  unsubscribe: null,
  loadingPersonIds: new Set<string>(),

  setNPeople: (nPeople: number) => set({ nPeople }),
  setHasMore: (hasMore: boolean) => set({ hasMore }),

  getPeopleCount: async (q) => {
    try {
      const snap = await getCountFromServer(q);
      const { count } = snap.data();
      const { people } = get();

      set({ nPeople: count, hasMore: count > people.length });
    } catch (error) {
      console.error("Error getting people count:", error);
    }
  },

  subscribeToPeople: (wid: string) => {
    const { unsubscribe } = get();

    if (unsubscribe) {
      unsubscribe();
    }

    // Clear previous state immediately when switching workspaces
    set({
      people: [],
      nPeople: 0,
      hasMore: true,
      nextQuery: null,
    });

    const q = buildQuery(wid);

    const newUnsubscribe = onSnapshot(q, (snapshot) => {
      const people = snapshot.docs.map((doc) => doc.data() as IPerson);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const next = buildQuery(wid, true, lastVisible);

      set({
        people: people,
        nextQuery: next,
      });

      // Update count as well
      const qWithoutLimits = buildQuery(wid, false);
      get().getPeopleCount(qWithoutLimits);
    });

    const qWithoutLimits = buildQuery(wid, false);
    get().getPeopleCount(qWithoutLimits);

    set({ unsubscribe: newUnsubscribe });
  },

  unsubscribeFromPeople: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  fetchNextPeople: async (wid: string) => {
    const { nextQuery } = get();

    try {
      const first = buildQuery(wid);
      const queryToUse = nextQuery ?? first;

      const snaps = await getDocs(queryToUse);

      if (snaps.empty) {
        set({ hasMore: false });
        return;
      }

      const data = snaps.docs.map((doc) => doc.data()) as IPerson[];
      const lastVisible = snaps.docs[snaps.docs.length - 1];
      const next = buildQuery(wid, true, lastVisible);

      const { people } = get();

      const updatedPeople = [...people, ...data];
      set({ people: updatedPeople, nextQuery: next });

      const qWithoutLimits = buildQuery(wid, false);
      const snap = await getCountFromServer(qWithoutLimits);
      const { count } = snap.data();

      set({ nPeople: count, hasMore: count > updatedPeople.length });
    } catch (error) {
      console.log("error fetching next people: ", error);
    }
  },
}));

const buildQuery = (
  wid: string,
  includeLimits = true,
  lastVisible?: any
): Query => {
  const ref = collection(db, `workspaces/${wid}/people`);

  const fetchOrder = orderBy("updatedAt", "desc");
  const lt = limit(20);

  const filters = [];
  if (lastVisible) filters.push(startAfter(lastVisible));

  if (includeLimits) filters.push(lt);
  if (filters.length > 0) {
    return query(ref, fetchOrder, ...filters);
  } else {
    return query(ref, fetchOrder);
  }
};
