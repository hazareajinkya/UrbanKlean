import knowledgeService from "@/lib/services/knowledge-service";
import { useQuery } from "@tanstack/react-query";

export const textKnowledgeKey = (wid: string) => ["text-knowledge", wid];
export const pdfKnowledgeKey = (wid: string) => ["pdf-knowledge", wid];
export const webKnowledgeKey = (wid: string) => ["web-knowledge", wid];

export const useTextKnowledge = (wid: string) => {
  return useQuery({
    queryKey: textKnowledgeKey(wid),
    queryFn: () => knowledgeService.getTextKnowledge(wid),
  });
};

export const usePdfKnowledge = (wid: string) => {
  return useQuery({
    queryKey: pdfKnowledgeKey(wid),
    queryFn: () => knowledgeService.getPdfKnowledge(wid),
  });
};

export const useWebKnowledge = (wid: string) => {
  return useQuery({
    queryKey: webKnowledgeKey(wid),
    queryFn: () => knowledgeService.getWebKnowledge(wid),
  });
};
