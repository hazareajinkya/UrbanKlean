import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/clients/axios-client";
import { toast } from "sonner";
import { waTemplateKey } from "./use-wa-templates";
import { IWaTemplate } from "@/lib/types/wa-api";

export interface ICreateTemplate {
  wid: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  parameter_format?: "NAMED" | "POSITIONAL";
  components: any[];
}

export interface IEditTemplate {
  wid: string;
  templateId: string;
  category?: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  components: any[];
}

export interface ISendMessage {
  wid: string;
  to: string;
  templateName: string;
  languageCode: string;
  components?: any[];
  aid?: string;
  sessionId?: string;
  previewText?: string;
}

export const useWaTemplateActions = () => {
  const qc = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: async (args: ICreateTemplate) => {
      const response = await apiClient.post("/api/wa-templates", args);
      return response.data.data as IWaTemplate;
    },
    onSuccess: (_, variables) => {
      toast.success("Template created successfully");
      qc.invalidateQueries({ queryKey: waTemplateKey(variables.wid) });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create template",
      );
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (args: { wid: string; templateName: string }) => {
      const response = await apiClient.delete(
        `/api/wa-templates?wid=${args.wid}&templateName=${args.templateName}`,
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Template deleted successfully");
      qc.invalidateQueries({ queryKey: waTemplateKey(variables.wid) });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete template",
      );
    },
  });

  const sendTestMessage = useMutation({
    mutationFn: async (args: ISendMessage) => {
      const response = await apiClient.post(
        "/api/wa-templates/test-message",
        args,
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Test message sent successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send test message",
      );
    },
  });

  const sendTemplateMessage = useMutation({
    mutationFn: async (args: ISendMessage) => {
      const response = await apiClient.post(
        "/api/wa-templates/send-message",
        args,
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Template message sent successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send template message",
      );
    },
  });

  const editTemplate = useMutation({
    mutationFn: async (args: IEditTemplate) => {
      const response = await apiClient.put("/api/wa-templates", args);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Template updated successfully");
      qc.invalidateQueries({ queryKey: waTemplateKey(variables.wid) });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update template",
      );
    },
  });

  const syncTemplates = useMutation({
    mutationFn: async (wid: string) => {
      const response = await apiClient.get(`/api/wa-templates?wid=${wid}&sync=true`);
      return response.data;
    },
    onSuccess: (_, wid) => {
      toast.success("Templates synced successfully");
      qc.invalidateQueries({ queryKey: waTemplateKey(wid) });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to sync templates",
      );
    },
  });

  return { createTemplate, editTemplate, deleteTemplate, sendTestMessage, sendTemplateMessage, syncTemplates };
};
