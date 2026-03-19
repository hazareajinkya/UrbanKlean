import actionService from "@/lib/services/action-service";
import { getwid } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const actionKey = (wid: string, id: string) => ["actions", wid, id];
export const actionsKey = (wid: string) => ["actions", wid];
export const globalActionsKey = (appSlug?: string) => [
  "global-actions",
  appSlug || "all",
];

export const useAIActions = (wid?: string) => {
  const qc = useQueryClient();
  const workspaceId = wid || getwid();

  const query = useQuery({
    queryKey: actionsKey(workspaceId),
    queryFn: () =>
      actionService.getActions(workspaceId).then((actions) => {
        actions?.forEach((action) =>
          qc.setQueryData(actionKey(workspaceId, action.id), action),
        );
        return actions;
      }),
    enabled: !!workspaceId,
  });

  return {
    actions: query.data,
    ...query,
  };
};

export const useAIAction = (actionId: string) => {
  const wid = getwid();

  const query = useQuery({
    queryKey: actionKey(wid, actionId),
    queryFn: () => actionService.getAction(wid, actionId),
    enabled: !!actionId && !!wid,
  });

  return {
    action: query.data,
    ...query,
  };
};



export const useGlobalActions = (appSlug?: string) => {
  const query = useQuery({
    queryKey: globalActionsKey(appSlug),
    queryFn: () => actionService.getGlobalActions(appSlug),
  });

  return {
    globalActions: query.data,
    ...query,
  };
};
