import knowledgeService from "@/lib/services/knowledge-service";
import { useQuery } from "@tanstack/react-query";

const textKnowledgeKey = (wid: string) => ["text-knowledge", wid];

export const useTextKnowledge = (wid: string) => {
  return useQuery({
    queryKey: textKnowledgeKey(wid),
    queryFn: () => knowledgeService.getTextKnowledge(wid),
  });
};
