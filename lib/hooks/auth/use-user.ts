import userService from "@/lib/services/user-service";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export const userKey = (email: string) => ["users", email];

export const useCurrentUser = () => {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const user = useQuery({
    queryKey: userKey(email),
    queryFn: () => userService.getUser(email),
    enabled: !!email,
  });

  return {
    ...user,
    user: user.data,
  };
};

export const useUser = (email: string) => {
  const user = useQuery({
    queryKey: userKey(email),
    queryFn: () => userService.getUser(email),
    enabled: !!email,
  });

  return {
    ...user,
    user: user.data,
  };
};
