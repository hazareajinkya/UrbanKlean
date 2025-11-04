import { useMutation, useQueryClient } from "@tanstack/react-query";
import trainService from "@/lib/services/train-services";
import { trainedContentKey } from "./use-trained-content";
import { textKnowledgeKey } from "../knowledge/use-knowledge-base";

type SaveKnowledgeArgs = {
  wid: string;
  title: string;
  description: string;
};

export const useTrainedContentActions = (wid: string) => {
  const queryClient = useQueryClient();

  const saveKnowledge = useMutation({
    mutationFn: async ({ wid, title, description }: SaveKnowledgeArgs) => {
      if (!wid) throw new Error("Missing wid");
      await trainService.updateTrainedContent(wid, title, description);
      return { ok: true } as const;
    },
    onSuccess: async () => {
      if (!wid) return;
      await queryClient.invalidateQueries({ queryKey: trainedContentKey(wid) });
      await queryClient.invalidateQueries({ queryKey: textKnowledgeKey(wid) });
    },
  });

  return { saveKnowledge };
};
