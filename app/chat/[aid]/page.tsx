import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ChatPageClient from "@/components/chat/chat-page-client";
import { agentKey } from "@/lib/hooks/agent/use-agent";
import { getServerQueryClient } from "@/lib/clients/get-server-query-client";
import agentService from "@/lib/services/agent-service";
import { IAgent } from "@/lib/types/agent";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ aid: string }>;
}) {
  const { aid } = await params;
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: agentKey(aid),
    queryFn: () => agentService.fetchAgent(aid),
  });
  const initialAgent = queryClient.getQueryData(agentKey(aid)) as
    | IAgent
    | undefined;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatPageClient aid={aid} initialAgent={initialAgent} />
    </HydrationBoundary>
  );
}
