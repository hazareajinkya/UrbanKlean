import axiosClient from "@/lib/clients/axios-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useKnowledgeActions = () => {
  const embedAndSaveText = useMutation({
    mutationFn: async ({
      wid,
      tid,
      content,
    }: {
      wid: string;
      tid: string;
      content: string;
    }) => {
      await axiosClient.post(`/api/embeddings/${wid}/text`, {
        tid: tid,
        content: content,
      });
    },
    onSuccess: () => {
      toast.success("Text embedded and saved successfully");
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  return {
    embedAndSaveText,
  };
};
