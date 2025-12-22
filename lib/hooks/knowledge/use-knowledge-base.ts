import knowledgeService from "@/lib/services/knowledge-service";
import { useQuery } from "@tanstack/react-query";
import { IPdfKnowledge, IWebKnowledge } from "@/lib/types/knowledge";

export const documentsKnowledgeKey = (wid: string, folderId: string) => [
  "knowledge-documents",
  wid,
  folderId,
];

export const websitesKnowledgeKey = (wid: string, folderId: string) => [
  "knowledge-websites",
  wid,
  folderId,
];

export const textsKnowledgeKey = (wid: string, folderId: string) => [
  "knowledge-texts",
  wid,
  folderId,
];

export const teachKnowledgeKey = (wid: string, folderId: string) => [
  "knowledge-teach",
  wid,
  folderId,
];

export const allTeachKnowledgeKey = (wid: string) => [
  "knowledge-teach-all",
  wid,
];

export const useDocumentsKnowledge = (wid: string, folderId: string) => {
  return useQuery({
    queryKey: documentsKnowledgeKey(wid, folderId),
    queryFn: () => knowledgeService.getAllPdfKnowledge(wid, folderId),
    enabled: Boolean(wid) && Boolean(folderId),
    refetchInterval: (query) => {
      const data = query.state.data as IPdfKnowledge["files"][number][];
      if (data?.some((item) => item.status === "training")) {
        return 5000;
      }
      return false;
    },
  });
};

export const useWebsitesKnowledge = (wid: string, folderId: string) => {
  return useQuery({
    queryKey: websitesKnowledgeKey(wid, folderId),
    queryFn: () => knowledgeService.getWebKnowledge(wid, folderId),
    enabled: Boolean(wid) && Boolean(folderId),
    refetchInterval: (query) => {
      const data = query.state.data as IWebKnowledge[];
      if (data?.some((item) => item.status === "training")) {
        return 5000;
      }
      return false;
    },
  });
};

export const useTextsKnowledge = (wid: string, folderId: string) => {
  return useQuery({
    queryKey: textsKnowledgeKey(wid, folderId),
    queryFn: () => knowledgeService.getAllTextKnowledge(wid, folderId),
    enabled: Boolean(wid) && Boolean(folderId),
  });
};

export const useTeachKnowledge = (wid: string, folderId: string) => {
  return useQuery({
    queryKey: teachKnowledgeKey(wid, folderId),
    queryFn: () => knowledgeService.getAllTeachKnowledge(wid, folderId),
    enabled: Boolean(wid) && Boolean(folderId),
  });
};

export const useAllTeachKnowledge = (wid: string) => {
  return useQuery({
    queryKey: allTeachKnowledgeKey(wid),
    queryFn: () => knowledgeService.getAllTeachKnowledgeAcrossFolders(wid),
    enabled: Boolean(wid),
  });
};
