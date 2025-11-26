import axiosClient from "@/lib/clients/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  pdfKnowledgeKey,
  teachKnowledgeKey,
  webKnowledgeKey,
} from "./use-knowledge-base";
import knowledgeService from "@/lib/services/knowledge-service";

export const useKnowledgeActions = () => {
  const qc = useQueryClient();

  const scrapeWebsite = useMutation({
    mutationFn: async ({ wid, url }: { wid: string; url: string }) => {
      return await knowledgeService.scrapeWebsite(wid, url);
    },
    onSuccess: () => {
      toast.success("Website scraped successfully");
    },
    onError: (error: Error) => {
      console.error("Scraping failed: ", error);
      toast.error("Failed to scrape website. Please try again.");
    },
  });

  const crawlWebsites = useMutation({
    mutationFn: async ({
      wid,
      baseUrl,
      urls,
    }: {
      wid: string;
      baseUrl: string;
      urls: string[];
    }) => {
      await axiosClient.post(`/api/embeddings/${wid}/web/multi`, {
        baseUrl,
        urls,
      });
    },
    onSuccess: (_, { wid }) => {
      toast.success("Crawling started successfully");
      qc.invalidateQueries({ queryKey: webKnowledgeKey(wid) });
    },
    onError: (error: Error) => {
      console.error("Crawling failed: ", error);
      toast.error("Failed to start crawl. Please try again.");
    },
  });

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
      toast.success("Text saved and trained successfully");
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const embedAndSavePdf = useMutation({
    mutationFn: async ({ wid, file }: { wid: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);

      await axiosClient.post(`/api/embeddings/${wid}/pdfs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (_, { wid }) => {
      toast.success("PDF saved and trained successfully");
      qc.invalidateQueries({ queryKey: pdfKnowledgeKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const deletePdf = useMutation({
    mutationFn: async ({ wid, did }: { wid: string; did: string }) => {
      await axiosClient.delete(`/api/embeddings/${wid}/pdfs?did=${did}`);
    },
    onSuccess: (_, { wid }) => {
      toast.success("PDF deleted successfully");
      qc.invalidateQueries({ queryKey: pdfKnowledgeKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const embedAndSaveWebsite = useMutation({
    mutationFn: async ({ wid, url }: { wid: string; url: string }) => {
      await axiosClient.post(`/api/embeddings/${wid}/web/single`, {
        url: url,
      });
    },
    onSuccess: (_, { wid }) => {
      toast.success("Website content embedded and saved successfully");
      qc.invalidateQueries({ queryKey: webKnowledgeKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const deleteWebsite = useMutation({
    mutationFn: async ({ wid, uid }: { wid: string; uid: string }) => {
      await axiosClient.delete(`/api/embeddings/${wid}/web/single?uid=${uid}`);
    },
    onSuccess: (_, { wid }) => {
      toast.success("Website deleted successfully");
      qc.invalidateQueries({ queryKey: webKnowledgeKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const deleteTeachKnowledge = useMutation({
    mutationFn: async ({ wid, tid }: { wid: string; tid: string }) => {
      await axiosClient.delete(`/api/embeddings/${wid}/teach?tid=${tid}`);
    },
    onSuccess: (_, { wid }) => {
      toast.success("Knowledge deleted successfully");
      qc.invalidateQueries({ queryKey: teachKnowledgeKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });
  return {
    embedAndSaveText,
    embedAndSavePdf,
    deletePdf,
    embedAndSaveWebsite,
    deleteWebsite,
    scrapeWebsite,
    crawlWebsites,
    deleteTeachKnowledge,
  };
};
