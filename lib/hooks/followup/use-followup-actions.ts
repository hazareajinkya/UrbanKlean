import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/clients/axios-client";
import queryClient from "@/lib/clients/query-client";
import { peopleCountKey, peopleKey } from "@/lib/hooks/people/use-people";
import { IFollowUpScheduleInput, IFollowUpTemplateConfig } from "@/lib/types/person";

type IFollowUpMutationArgs = {
  personId: string;
  phone: string;
  timezone: string;
  isOnTest?: boolean;
  template?: IFollowUpTemplateConfig | null;
  schedule: IFollowUpScheduleInput;
};

const useFollowUpActions = ({ wid }: { wid: string }) => {
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: peopleKey(wid) });
    queryClient.invalidateQueries({ queryKey: peopleCountKey(wid) });
  };

  const createFollowUp = useMutation({
    mutationFn: async (args: IFollowUpMutationArgs) => {
      const response = await apiClient.post("/api/followup", {
        wid,
        ...args,
      });
      return response.data.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Follow-up scheduled successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to schedule follow-up",
      );
    },
  });

  const updateFollowUp = useMutation({
    mutationFn: async (
      args: IFollowUpMutationArgs & {
        followUpId: string;
      },
    ) => {
      const response = await apiClient.patch("/api/followup", {
        wid,
        ...args,
      });
      return response.data.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Follow-up updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update follow-up",
      );
    },
  });

  const cancelFollowUp = useMutation({
    mutationFn: async (args: { personId: string; followUpId: string }) => {
      const response = await apiClient.delete("/api/followup", {
        data: {
          wid,
          ...args,
        },
      });

      return response.data.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Follow-up canceled");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel follow-up",
      );
    },
  });

  return {
    createFollowUp,
    updateFollowUp,
    cancelFollowUp,
  };
};

export default useFollowUpActions;
