import workspaceService from "@/lib/services/workspace-service";
import { useQuery } from "@tanstack/react-query";

export const workspaceKey = (ids: string[]) => ["workspaces", ids];

export const useWorkspaces = (ids: string[]) => {
  const workspaces = useQuery({
    queryKey: workspaceKey(ids),
    queryFn: () => workspaceService.fetchWorkspaces(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...workspaces,
    workspaces: workspaces.data,
  };
};
