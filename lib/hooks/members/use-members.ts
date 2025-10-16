import { useQuery } from "@tanstack/react-query";
import memberService from "@/lib/services/member-service";
import { IMember } from "@/lib/types/member";
import { IUser } from "@/lib/types/user";

export const membersKey = (wid: string) => ["members", wid];

export const useMembers = (wid: string) => {
  return useQuery({
    queryKey: membersKey(wid),
    queryFn: () => memberService.fetchMembersWithUserInfo(wid),
    enabled: !!wid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMember = (wid: string, email: string) => {
  return useQuery({
    queryKey: ["member", wid, email],
    queryFn: () => memberService.fetchMember(wid, email),
    enabled: !!wid && !!email,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
