import workspaceService from "@/lib/services/workspace-service";
import { useQueries, useQuery } from "@tanstack/react-query";

export const workspaceKey = (id: string) => ["workspaces", id];

export const useWorkspaces = (ids: string[]) => {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: workspaceKey(id),
      queryFn: () => workspaceService.fetchWorkspace(id),
    })),
  });

  const workspaces = queries
    .map((query) => query.data)
    .filter((ws) => ws !== undefined);

  const isLoading = queries.some((query) => query.isLoading);

  return {
    workspaces,
    isLoading,
  };
};

export const useWorkspace = (wid: string) => {
  const query = useQuery({
    queryKey: workspaceKey(wid),
    queryFn: () => workspaceService.fetchWorkspace(wid),
  });

  return {
    workspace: query.data,
    ...query,
  };
};
