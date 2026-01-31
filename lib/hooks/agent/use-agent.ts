import agentService from "@/lib/services/agent-service";
import { IAgent } from "@/lib/types/agent";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const agentKey = (id: string) => ["agents", id];
export const agentsKey = (wid: string) => ["agents", wid];

export const useAgents = (wid: string) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: agentsKey(wid),

    queryFn: () =>
      agentService.fetchAgents(wid).then((agents) => {
        agents.map((agent) => qc.setQueryData(agentKey(agent.id), agent));
        return agents;
      }),
  });

  return {
    agents: query.data,
    ...query,
  };
};

export const useAgent = (aid: string, initialAgent?: IAgent) => {
  const query = useQuery({
    queryKey: agentKey(aid),
    queryFn: () => agentService.fetchAgent(aid),
    initialData: initialAgent,
    staleTime: 1000 * 60 * 5, // 5 minutes - agent data rarely changes
    initialDataUpdatedAt: initialAgent ? Date.now() : undefined,
  });

  return {
    agent: query.data,
    ...query,
  };
};
