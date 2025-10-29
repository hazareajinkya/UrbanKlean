import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import userService from "@/lib/services/user-service";
import { handleError } from "@/lib/utils";
import { useCurrentUser, userKey } from "@/lib/hooks/user/use-user";

export const useUserActions = () => {
  const { user } = useCurrentUser();
  const email = user?.email || "";
  const qc = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async ({ name, file }: { name?: string; file?: File }) =>
      userService.updateUserProfile(name, file, user!),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: userKey(email) });
      toast.success("Profile updated");
    },
    onError: handleError,
  });

  return { updateProfile };
};
