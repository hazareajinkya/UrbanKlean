import teachService from "@/lib/services/teach-services";
import { getTeachLocalSession } from "@/components/chat/chat-utils";
import { useQuery } from "@tanstack/react-query";

export const teachSessionKey = (wid: string) => ["teach-sessions", wid];

export const useTeachSession = (wid: string) => {
  const sid = getTeachLocalSession(wid)!;

  const query = useQuery({
    queryKey: [...teachSessionKey(wid), sid],
    queryFn: () => teachService.getTeachSession(wid, sid),
    enabled: !!sid,
  });

  return {
    session: query.data,
    ...query,
  };
};
