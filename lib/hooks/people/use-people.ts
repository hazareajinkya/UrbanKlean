import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import peopleServiceV2 from "@/lib/services/people-service-v2";
import { IChannelProvider } from "@/lib/types/channel";
import { IPeopleStore, usePeopleStore } from "@/lib/stores/people-store";

export const peopleKey = (wid: string) => ["people", wid];
export const peopleCountKey = (wid: string) => ["peopleCount", wid];
export const allIdenticalPersonsKey = (wid: string) => [
  "allIdenticalPersons",
  wid,
];
export const identicalPersonsKey = (wid: string, personId: string) => [
  "identicalPersons",
  wid,
  personId,
];
export const usePeople = ({
  wid,
  searchQuery,
  selectedChannels,
  selectedTags,
}: {
  wid: string;
  searchQuery: string;
  selectedChannels: IChannelProvider[];
  selectedTags: string[];
}) => {
  const people = usePeopleStore((state: IPeopleStore) => state.people);
  const rawPeople = usePeopleStore((state: IPeopleStore) => state.rawPeople);
  const hasMore = usePeopleStore((state: IPeopleStore) => state.hasMore);
  const nPeople = usePeopleStore((state: IPeopleStore) => state.nPeople);
  const isLoading = usePeopleStore(
    (state: IPeopleStore) => state.isInitialLoading,
  );
  const isFetchingNext = usePeopleStore(
    (state: IPeopleStore) => state.isFetchingNext,
  );
  const resetAndLoadPeople = usePeopleStore(
    (state: IPeopleStore) => state.resetAndLoadPeople,
  );
  const loadMorePeople = usePeopleStore(
    (state: IPeopleStore) => state.loadMorePeople,
  );
  const applyLocalFilters = usePeopleStore(
    (state: IPeopleStore) => state.applyLocalFilters,
  );
  const resetStore = usePeopleStore((state: IPeopleStore) => state.resetStore);

  const canonicalSelectedTags = useMemo(
    () =>
      [...new Set(selectedTags.filter(Boolean))].sort((left, right) =>
        left.localeCompare(right),
      ),
    [selectedTags],
  );
  const canonicalSelectedChannels = useMemo(
    () =>
      [...new Set(selectedChannels.filter(Boolean))].sort((left, right) =>
        left.localeCompare(right),
      ),
    [selectedChannels],
  );
  const tagSignature = canonicalSelectedTags.join("|");
  const channelSignature = canonicalSelectedChannels.join("|");

  useEffect(() => {
    if (!wid) {
      resetStore();
      return;
    }

    resetAndLoadPeople({
      wid,
      selectedTags: canonicalSelectedTags,
      searchQuery,
      selectedChannels: canonicalSelectedChannels,
    });
  }, [wid, tagSignature, resetAndLoadPeople]);

  useEffect(() => {
    applyLocalFilters({
      searchQuery,
      selectedChannels: canonicalSelectedChannels,
    });
  }, [searchQuery, channelSignature, applyLocalFilters]);

  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  const loadMore = () => {
    loadMorePeople();
  };

  return {
    people,
    rawPeople,
    hasMore,
    nPeople,
    loadMore,
    isLoading,
    isFetchingNext,
  };
};

export const useIdenticalPersons = (wid: string, personId: string) => {
  return useQuery({
    queryKey: identicalPersonsKey(wid, personId),
    queryFn: () => peopleServiceV2.getIdenticalPersons(wid, personId),
    enabled: !!wid && !!personId,
  });
};

export const useAllIdenticalPersons = (wid: string) => {
  return useQuery({
    queryKey: allIdenticalPersonsKey(wid),
    queryFn: () => peopleServiceV2.getAllIdenticalPersons(wid),
    enabled: !!wid,
  });
};
