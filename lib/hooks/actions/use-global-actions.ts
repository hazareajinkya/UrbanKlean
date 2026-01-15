import globalActionService from "@/lib/services/global-action-service";
import { useQuery } from "@tanstack/react-query";

export const globalActionsKey = (integrationTypes?: string[]) => [
  "global-actions",
  integrationTypes,
];

export const useGlobalActions = (integrationTypes?: string[]) => {
  const query = useQuery({
    queryKey: globalActionsKey(integrationTypes),
    queryFn: () =>
      integrationTypes && integrationTypes.length > 0
        ? globalActionService.getGlobalActionsByIntegrations(integrationTypes)
        : globalActionService.getGlobalActions({ type: "integration" }),
    enabled: true,
  });

  return {
    actions: query.data,
    ...query,
  };
};
