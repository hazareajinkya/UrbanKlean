import ChatPageClient from "@/components/chat/chat-page-client";
import agentService from "@/lib/services/agent-service";

const fetchAgent = async (aid: string) => {
  const agent = await agentService.fetchAgent(aid);
  return agent ?? undefined;
};

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ aid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { aid } = await params;
  const { widget, fromPage } = await searchParams;
  const initialAgent = await fetchAgent(aid);

  return (
    <ChatPageClient
      aid={aid}
      initialAgent={initialAgent}
      widget={widget as string}
      fromPageValue={fromPage as string}
    />
  );
}
