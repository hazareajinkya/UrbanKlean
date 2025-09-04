import agentService from "@/lib/services/agent-service";
import { getwid } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const agentKey = (id: string) => ["agents", id];
export const agentsKey = () => ["agents"];

export const useAgents = () => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: agentsKey(),
    queryFn: () =>
      agentService.fetchAgents(getwid()).then((agents) => {
        agents.map((agent) => qc.setQueryData(agentKey(agent.id), agent));
        return agents;
      }),
  });

  return {
    agents: query.data,
    ...query,
  };
};

export const useAgent = (aid: string) => {
  const query = useQuery({
    queryKey: agentKey(aid),
    queryFn: () => agentService.fetchAgent(aid),
  });

  return {
    agent: query.data,
    ...query,
  };
};
