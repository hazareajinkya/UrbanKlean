import axiosClient from "@/lib/clients/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pdfKnowledgeKey, webKnowledgeKey } from "./use-knowledge-base";

export const useKnowledgeActions = () => {
  const qc = useQueryClient();

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
      toast.success("PDF embedded and saved successfully");
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
      await axiosClient.post(`/api/embeddings/${wid}/web`, {
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
      await axiosClient.delete(`/api/embeddings/${wid}/web?uid=${uid}`);
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

  return {
    embedAndSaveText,
    embedAndSavePdf,
    deletePdf,
    embedAndSaveWebsite,
    deleteWebsite,
  };
};
