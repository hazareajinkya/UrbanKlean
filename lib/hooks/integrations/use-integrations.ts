import integrationsService from "@/lib/services/integrations-service";
import { useQuery } from "@tanstack/react-query";

export const integrationsKey = (wid: string) => ["integrations", wid];

export const useIntegrations = (wid: string) => {
  const query = useQuery({
    queryKey: integrationsKey(wid),
    queryFn: () => integrationsService.getIntegrations(wid),
    enabled: !!wid,
  });

  return {
    integrations: query.data,
    ...query,
  };
};
