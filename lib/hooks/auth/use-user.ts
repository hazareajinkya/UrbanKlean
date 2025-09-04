import userService from "@/lib/services/user-service";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export const userKey = (email: string) => ["users", email];

export const useCurrentUser = () => {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const query = useQuery({
    queryKey: userKey(email),
    queryFn: () => userService.getUser(email),
  });

  return {
    user: query.data,
    ...query,
  };
};

export const useUser = (email: string) => {
  return useQuery({
    queryKey: userKey(email),
    queryFn: () => userService.getUser(email),
    enabled: !!email,
  });
};
