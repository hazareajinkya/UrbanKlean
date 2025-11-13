import { queryClient } from "@/lib/clients/query-client";
import chatService from "@/lib/services/chat-service";
import { ISession } from "@/lib/types/session";
import { getLocalSession } from "@/components/chat/chat-utils";
import { useQuery } from "@tanstack/react-query";

export const sessionKey = (sid: string) => ["sessions", sid];

export const useSession = (aid: string) => {
  const sid = getLocalSession(aid);

  const query = useQuery({
    queryKey: sessionKey(sid!),
    queryFn: () => chatService.getSession(sid!, aid),
    enabled: !!sid,
  });

  const updateSession = (session: ISession) => {
    queryClient.setQueryData(sessionKey(session.id), session);
  };

  return {
    session: query.data,
    ...query,
    updateSession,
  };
};
