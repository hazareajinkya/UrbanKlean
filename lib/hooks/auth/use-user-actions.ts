import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import userService from "@/lib/services/user-service";
import storageService from "@/lib/services/storage-service";
import { handleError } from "@/lib/utils";
import { useCurrentUser, userKey } from "@/lib/hooks/auth/use-user";

type UpdateProfileInput = {
  name?: string;
  file?: File | null;
};

export const useUserActions = () => {
  const { data } = useCurrentUser();
  const email = data?.email || "";
  const uid = data?.id;
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async ({ name, file }: UpdateProfileInput) => {
      if (!email) throw new Error("No authenticated user");

      let photoUrl: string | undefined;

      if (file) {
        if (!uid) throw new Error("No authenticated user id");
        const path = `users/${uid}/profile`;
        const upload = await storageService.uploadFile(file, path, file.name);
        photoUrl = upload.downloadURL;
      }

      const updates: { name?: string; photoUrl?: string } = {};
      if (typeof name === "string") updates.name = name.trim();
      if (photoUrl) updates.photoUrl = photoUrl;

      if (Object.keys(updates).length === 0) return true;

      await userService.updateUser(email, updates);
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKey(email) });
      toast.success("Profile updated");
    },
    onError: handleError,
  });

  return { updateProfile };
};
