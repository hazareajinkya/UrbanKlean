import {
  collection,
  DocumentData,
  DocumentSnapshot,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../clients/firebase";
import { IChannelProvider } from "../types/channel";
import { IPerson } from "../types/person";

const PEOPLE_PAGE_LIMIT = 20;
const MAX_TAG_QUERY_VALUES = 10;

type PeopleQueryState = {
  wid: string;
  selectedTags: string[];
  tagSignature: string;
};

type PeopleLocalFilterState = {
  searchQuery: string;
  selectedChannels: IChannelProvider[];
  channelSignature: string;
};

type IndexedPerson = {
  person: IPerson;
  searchText: string;
  channels: IChannelProvider[];
};

export interface IPeopleStore {
  nPeople: number;
  hasMore: boolean;
  lastVisible: DocumentSnapshot<DocumentData> | null;
  people: IPerson[];
  rawPeople: IPerson[];
  indexedPeople: IndexedPerson[];
  queryState: PeopleQueryState;
  localFilters: PeopleLocalFilterState;
  isInitialLoading: boolean;
  isFetchingNext: boolean;
  hasHydratedInitialPage: boolean;
  activeRequestId: number;

  resetStore: () => void;
  resetAndLoadPeople: (args: {
    wid: string;
    selectedTags: string[];
    searchQuery: string;
    selectedChannels: IChannelProvider[];
  }) => Promise<void>;
  loadMorePeople: () => Promise<void>;
  applyLocalFilters: (args: {
    searchQuery: string;
    selectedChannels: IChannelProvider[];
  }) => void;
  refreshCount: (args: {
    wid: string;
    selectedTags: string[];
    requestId: number;
  }) => Promise<void>;
}

const emptyQueryState: PeopleQueryState = {
  wid: "",
  selectedTags: [],
  tagSignature: "",
};

const emptyLocalFilters: PeopleLocalFilterState = {
  searchQuery: "",
  selectedChannels: [],
  channelSignature: "",
};

export const usePeopleStore = create<IPeopleStore>((set, get) => ({
  nPeople: 0,
  hasMore: true,
  lastVisible: null,
  people: [],
  rawPeople: [],
  indexedPeople: [],
  queryState: emptyQueryState,
  localFilters: emptyLocalFilters,
  isInitialLoading: false,
  isFetchingNext: false,
  hasHydratedInitialPage: false,
  activeRequestId: 0,

  resetStore: () => {
    set({
      nPeople: 0,
      hasMore: true,
      lastVisible: null,
      people: [],
      rawPeople: [],
      indexedPeople: [],
      queryState: emptyQueryState,
      localFilters: emptyLocalFilters,
      isInitialLoading: false,
      isFetchingNext: false,
      hasHydratedInitialPage: false,
      activeRequestId: get().activeRequestId + 1,
    });
  },

  refreshCount: async ({ wid, selectedTags, requestId }) => {
    try {
      const countQuery = buildCountQuery({ wid, selectedTags });
      const snap = await getCountFromServer(countQuery);

      if (get().activeRequestId !== requestId) {
        return;
      }

      const { count } = snap.data();
      const { rawPeople } = get();

      set({
        nPeople: count,
        hasMore: count > rawPeople.length,
      });
    } catch (error) {
      console.error("Error getting people count:", error);
    }
  },

  applyLocalFilters: ({ searchQuery, selectedChannels }) => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const normalizedChannels = normalizeChannels(selectedChannels);
    const channelSignature = buildSignature(normalizedChannels);
    const { indexedPeople } = get();

    set({
      localFilters: {
        searchQuery: normalizedSearchQuery,
        selectedChannels: normalizedChannels,
        channelSignature,
      },
      people: filterIndexedPeople({
        indexedPeople,
        searchQuery: normalizedSearchQuery,
        selectedChannels: normalizedChannels,
      }),
    });
  },

  resetAndLoadPeople: async ({
    wid,
    selectedTags,
    searchQuery,
    selectedChannels,
  }) => {
    const normalizedTags = normalizeTags(selectedTags);
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const normalizedChannels = normalizeChannels(selectedChannels);
    const nextRequestId = get().activeRequestId + 1;

    set({
      nPeople: 0,
      hasMore: true,
      lastVisible: null,
      people: [],
      rawPeople: [],
      indexedPeople: [],
      queryState: {
        wid,
        selectedTags: normalizedTags,
        tagSignature: buildSignature(normalizedTags),
      },
      localFilters: {
        searchQuery: normalizedSearchQuery,
        selectedChannels: normalizedChannels,
        channelSignature: buildSignature(normalizedChannels),
      },
      isInitialLoading: true,
      isFetchingNext: false,
      hasHydratedInitialPage: false,
      activeRequestId: nextRequestId,
    });

    try {
      const peopleQuery = buildPeopleQuery({
        wid,
        selectedTags: normalizedTags,
      });
      const snaps = await getDocs(peopleQuery);

      if (get().activeRequestId !== nextRequestId) {
        return;
      }

      const rawPeople = snaps.docs.map((doc) => doc.data() as IPerson);
      const indexedPeople = indexPeople(rawPeople);
      const filteredPeople = filterIndexedPeople({
        indexedPeople,
        searchQuery: normalizedSearchQuery,
        selectedChannels: normalizedChannels,
      });
      const lastVisible =
        snaps.docs.length > 0 ? snaps.docs[snaps.docs.length - 1] : null;

      set({
        rawPeople,
        indexedPeople,
        people: filteredPeople,
        lastVisible,
        hasHydratedInitialPage: true,
        hasMore: snaps.docs.length === PEOPLE_PAGE_LIMIT,
      });

      await get().refreshCount({
        wid,
        selectedTags: normalizedTags,
        requestId: nextRequestId,
      });
    } catch (error) {
      console.error("Error loading people:", error);

      if (get().activeRequestId !== nextRequestId) {
        return;
      }

      set({
        hasMore: false,
      });
    } finally {
      if (get().activeRequestId === nextRequestId) {
        set({ isInitialLoading: false });
      }
    }
  },

  loadMorePeople: async () => {
    const {
      queryState,
      localFilters,
      rawPeople,
      isFetchingNext,
      hasMore,
      lastVisible,
      activeRequestId,
      hasHydratedInitialPage,
    } = get();

    if (
      !queryState.wid ||
      !hasHydratedInitialPage ||
      !lastVisible ||
      isFetchingNext ||
      !hasMore
    ) {
      return;
    }

    set({ isFetchingNext: true });

    try {
      const peopleQuery = buildPeopleQuery({
        wid: queryState.wid,
        selectedTags: queryState.selectedTags,
        lastVisible,
      });
      const snaps = await getDocs(peopleQuery);

      if (get().activeRequestId !== activeRequestId) {
        return;
      }

      if (snaps.empty) {
        set({ hasMore: false });
        return;
      }

      const nextPeople = snaps.docs.map((doc) => doc.data() as IPerson);
      const mergedRawPeople = mergePeople(rawPeople, nextPeople);
      const indexedPeople = indexPeople(mergedRawPeople);
      const filteredPeople = filterIndexedPeople({
        indexedPeople,
        searchQuery: localFilters.searchQuery,
        selectedChannels: localFilters.selectedChannels,
      });
      const nextLastVisible = snaps.docs[snaps.docs.length - 1] ?? null;

      set({
        rawPeople: mergedRawPeople,
        indexedPeople,
        people: filteredPeople,
        lastVisible: nextLastVisible,
        hasMore: snaps.docs.length === PEOPLE_PAGE_LIMIT,
      });

      await get().refreshCount({
        wid: queryState.wid,
        selectedTags: queryState.selectedTags,
        requestId: activeRequestId,
      });
    } catch (error) {
      console.error("Error loading more people:", error);
    } finally {
      if (get().activeRequestId === activeRequestId) {
        set({ isFetchingNext: false });
      }
    }
  },
}));

const buildPeopleQuery = (args: {
  wid: string;
  selectedTags: string[];
  lastVisible?: DocumentSnapshot<DocumentData> | null;
}) => {
  const { wid, selectedTags, lastVisible } = args;
  const peopleRef = collection(db, `workspaces/${wid}/people`);
  const filters: Array<Query<DocumentData> | any> = [];

  if (selectedTags.length > 0) {
    filters.push(where("tags", "array-contains-any", selectedTags));
  }

  filters.push(orderBy("updatedAt", "desc"));

  if (lastVisible) {
    filters.push(startAfter(lastVisible));
  }

  filters.push(limit(PEOPLE_PAGE_LIMIT));

  return query(peopleRef, ...filters);
};

const buildCountQuery = (args: { wid: string; selectedTags: string[] }) => {
  const { wid, selectedTags } = args;
  const peopleRef = collection(db, `workspaces/${wid}/people`);

  if (selectedTags.length > 0) {
    return query(peopleRef, where("tags", "array-contains-any", selectedTags));
  }

  return query(peopleRef);
};

const normalizeTags = (selectedTags: string[]) => {
  return [...new Set(selectedTags.filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
    .slice(0, MAX_TAG_QUERY_VALUES);
};

const normalizeChannels = (selectedChannels: IChannelProvider[]) => {
  return [...new Set(selectedChannels.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
};

const buildSignature = (values: string[]) => values.join("|");

const mergePeople = (currentPeople: IPerson[], nextPeople: IPerson[]) => {
  const peopleById = new Map<string, IPerson>();

  for (const person of currentPeople) {
    peopleById.set(person.id, person);
  }

  for (const person of nextPeople) {
    peopleById.set(person.id, person);
  }

  return Array.from(peopleById.values()).sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
};

const indexPeople = (people: IPerson[]): IndexedPerson[] => {
  return people.map((person) => {
    const channels = normalizeChannels(
      (Array.isArray(person.externalIds) ? person.externalIds : [])
        .map((externalId) => externalId?.provider)
        .filter(Boolean) as IChannelProvider[],
    );
    const searchText = [
      person.name,
      person.company,
      ...(person.emails?.map((email) => email?.value) ?? []),
      ...(person.phones?.map((phone) => phone?.value) ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return {
      person,
      searchText,
      channels,
    };
  });
};

const filterIndexedPeople = (args: {
  indexedPeople: IndexedPerson[];
  searchQuery: string;
  selectedChannels: IChannelProvider[];
}) => {
  const { indexedPeople, searchQuery, selectedChannels } = args;

  return indexedPeople
    .filter((indexedPerson) => {
      if (searchQuery && !indexedPerson.searchText.includes(searchQuery)) {
        return false;
      }

      if (
        selectedChannels.length > 0 &&
        !selectedChannels.some((channel) =>
          indexedPerson.channels.includes(channel),
        )
      ) {
        return false;
      }

      return true;
    })
    .map((indexedPerson) => indexedPerson.person);
};
