import chatService from "@/lib/services/chat-service";
import { useQuery } from "@tanstack/react-query";

export const sessionKey = (sid: string) => ["sessions", sid];

export const useSession = (aid: string) => {
  const sid = localStorage.getItem("session_id") ?? undefined;

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
