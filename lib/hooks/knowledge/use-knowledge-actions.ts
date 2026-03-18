import { axiosClient } from "@/lib/clients/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  documentsKnowledgeKey,
  websitesKnowledgeKey,
  textsKnowledgeKey,
  teachKnowledgeKey,
} from "./use-knowledge-base";
import knowledgeService from "@/lib/services/knowledge-service";
import { handleError } from "@/lib/utils";
import { foldersKey } from "../folders/use-folders";

export const useKnowledgeActions = () => {
  const qc = useQueryClient();

  const scrapeWebsite = useMutation({
    mutationFn: async ({ wid, url }: { wid: string; url: string }) => {
      return await knowledgeService.scrapeWebsite(wid, url);
    },
    onSuccess: () => {
      toast.success("Website scraped successfully");
    },
    onError: handleError,
  });

  const crawlWebsites = useMutation({
    mutationFn: async ({
      wid,
      urls,
    }: {
      wid: string;
      urls: { folderId: string; url: string, folderName: string }[];
    }) => {
      await axiosClient.post(`/api/embeddings/${wid}/web/multi`, {
        urls,
      });
    },
    onSuccess: (_, { wid, urls }) => {
      toast.success("Crawling started successfully");
      const uniqueFolderIds = new Set(urls.map((u) => u.folderId));
      uniqueFolderIds.forEach((folderId) => {
        qc.invalidateQueries({ queryKey: websitesKnowledgeKey(wid, folderId) });
      });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const updateText = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      textId,
      content,
      title,
    }: {
      wid: string;
      folderId: string;
      textId: string;
      content: string;
      title: string;
    }) => {
      await axiosClient.put(
        `/api/embeddings/${wid}/folders/${folderId}/text?textId=${textId}`,
        {
          content,
          title,
        }
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("Text updated successfully");
      qc.invalidateQueries({ queryKey: textsKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const embedAndSaveText = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      content,
      title,
    }: {
      wid: string;
      folderId: string;
      content: string;
      title: string;
    }) => {
      await axiosClient.post(
        `/api/embeddings/${wid}/folders/${folderId}/text`,
        {
          content: content,
          title: title,
        }
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("Text saved and trained successfully");
      qc.invalidateQueries({ queryKey: textsKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const embedAndSavePdf = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      file,
    }: {
      wid: string;
      folderId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);

      await axiosClient.post(
        `/api/embeddings/${wid}/folders/${folderId}/pdfs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("PDF saved and trained successfully");
      qc.invalidateQueries({ queryKey: documentsKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const deletePdf = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      did,
    }: {
      wid: string;
      folderId: string;
      did: string;
    }) => {
      await axiosClient.delete(
        `/api/embeddings/${wid}/folders/${folderId}/pdfs?did=${did}`
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("PDF deleted successfully");
      qc.invalidateQueries({ queryKey: documentsKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const embedAndSaveWebsite = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      url,
    }: {
      wid: string;
      folderId: string;
      url: string;
    }) => {
      await axiosClient.post(
        `/api/embeddings/${wid}/folders/${folderId}/web/single`,
        {
          url: url,
        }
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("Website content embedded and saved successfully");
      qc.invalidateQueries({ queryKey: websitesKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const deleteWebsite = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      uid,
    }: {
      wid: string;
      folderId: string;
      uid: string;
    }) => {
      await axiosClient.delete(
        `/api/embeddings/${wid}/folders/${folderId}/web/single?uid=${uid}`
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("Website deleted successfully");
      qc.invalidateQueries({ queryKey: websitesKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const deleteText = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      textId,
    }: {
      wid: string;
      folderId: string;
      textId: string;
    }) => {
      await axiosClient.delete(
        `/api/embeddings/${wid}/folders/${folderId}/text?textId=${textId}`
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("Text deleted successfully");
      qc.invalidateQueries({ queryKey: textsKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const deleteTeachKnowledge = useMutation({
    mutationFn: async ({
      wid,
      folderId,
      tid,
    }: {
      wid: string;
      folderId: string;
      tid: string;
    }) => {
      await axiosClient.delete(
        `/api/embeddings/${wid}/folders/${folderId}/teach?tid=${tid}`
      );
    },
    onSuccess: (_, { wid, folderId }) => {
      toast.success("Knowledge deleted successfully");
      qc.invalidateQueries({ queryKey: teachKnowledgeKey(wid, folderId) });
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });
  return {
    embedAndSaveText,
    embedAndSavePdf,
    deletePdf,
    embedAndSaveWebsite,
    deleteWebsite,
    scrapeWebsite,
    crawlWebsites,
    deleteText,
    deleteTeachKnowledge,
    updateText,
  };
};
