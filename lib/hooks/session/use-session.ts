import { getLocalSession } from "@/components/chat/chat-utils";
import chatService from "@/lib/services/chat-service";
import { useQuery } from "@tanstack/react-query";

export const sessionKey = (sid: string) => ["sessions", sid];

export const useSession = (aid: string) => {
  const sid = getLocalSession(aid);

  const query = useQuery({
    queryKey: sessionKey(sid!),
    queryFn: () => chatService.getSession(sid!, aid),
    enabled: !!sid,
  });

  return {
    session: query.data,
    ...query,
  };
};
