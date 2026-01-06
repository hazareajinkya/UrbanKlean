import { useQuery, useQueryClient } from "@tanstack/react-query";
import memberService from "@/lib/services/member-service";
import { IMember } from "@/lib/types/member";
import { IUser } from "@/lib/types/user";

export const membersKey = (wid: string) => ["members", wid];
export const memberKey = (wid: string, email: string) => [
  "members",
  wid,
  email,
];

export const useMembers = (wid: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: membersKey(wid),
    queryFn: async () => {
      const members = await memberService.fetchMembersWithUserInfo(wid);
      members.map((member) => {
        queryClient.setQueryData(memberKey(wid, member.email), member);
      });
      return members;
    },
    enabled: !!wid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMember = (wid: string, email: string) => {
  return useQuery({
    queryKey: memberKey(wid, email),
    queryFn: () => memberService.fetchMember(wid, email),
    enabled: !!wid && !!email,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
