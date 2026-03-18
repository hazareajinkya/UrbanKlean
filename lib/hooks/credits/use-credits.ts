import { useQuery } from "@tanstack/react-query";
import creditsService from "@/lib/services/credits-service";

export const creditsKey = (args: { userEmail?: string; wid?: string }) => {
  return [
    "credits",
    args.wid ? `wid:${args.wid}` : "wid:none",
    args.userEmail ? `user:${args.userEmail}` : "user:none",
  ] as const;
};

export const useCredits = (args: { userEmail?: string; wid?: string }) => {
  const enabled = Boolean(args.userEmail || args.wid);

  return useQuery({
    queryKey: creditsKey(args),
    queryFn: () => creditsService.getCredits(args),
    enabled,
  });
};
