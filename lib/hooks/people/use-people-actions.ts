import { useMutation } from "@tanstack/react-query";
import peopleService from "@/lib/services/people-service";
import { toast } from "sonner";
import { IPerson } from "@/lib/types/person";

export const usePeopleActions = () => {
  const updatePerson = useMutation({
    mutationFn: async ({
      wid,
      personId,
      updates,
    }: {
      wid: string;
      personId: string;
      updates: Partial<IPerson>;
    }) => {
      return await peopleService.updatePerson(wid, personId, updates);
    },
    onSuccess: () => {
      toast.success("Customer updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating person:", error);
      toast.error("Failed to update customer");
    },
  });

  return {
    updatePerson,
  };
};

