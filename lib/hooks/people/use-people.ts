import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { DocumentSnapshot } from "firebase/firestore";
import peopleService, {
  PEOPLE_PAGE_LIMIT,
} from "../../services/people-service";

export const peopleKey = (wid: string) => ["people", wid];
export const peopleCountKey = (wid: string) => ["peopleCount", wid];
export const usePeople = (wid: string) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: peopleKey(wid),
      queryFn: async ({ pageParam }) => {
        return peopleService.getPeoplePage(
          wid,
          pageParam as DocumentSnapshot | null,
          PEOPLE_PAGE_LIMIT
        );
      },
      initialPageParam: null as DocumentSnapshot | null,
      getNextPageParam: (lastPage) => {
        if (lastPage.people.length < PEOPLE_PAGE_LIMIT) return undefined;
        return lastPage.lastVisible || undefined;
      },
      enabled: !!wid,
    });

  const { data: nPeople = 0 } = useQuery({
    queryKey: peopleCountKey(wid),
    queryFn: () => peopleService.getPeopleCount(wid),
    enabled: !!wid,
  });

  const people = data?.pages.flatMap((page) => page.people) ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    people,
    hasMore: hasNextPage,
    nPeople,
    loadMore,
    isLoading,
    isFetchingNext: isFetchingNextPage,
  };
};
