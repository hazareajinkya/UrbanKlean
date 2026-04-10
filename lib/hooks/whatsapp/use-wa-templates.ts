import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/clients/axios-client";
import { IWaTemplate } from "@/lib/types/wa-api";

export const waTemplatesKey = () => ["wa-templates"] as const;
export const waTemplateKey = (wid: string) => ["wa-templates", wid] as const;

export const EMPTY_WA_TEMPLATES: IWaTemplate[] = [];

export const useWaTemplates = (
  wid: string,
  args?: { enabled?: boolean },
) => {
  const enabled = args?.enabled ?? true;

  return useQuery({
    queryKey: waTemplateKey(wid),
    queryFn: async (): Promise<IWaTemplate[]> => {
      try {
        const response = await apiClient.get(`/api/wa-templates?wid=${wid}`);
        return response.data.data;
      } catch (error: unknown) {
        const err = error as { status?: number; message?: string };
        if (
          err?.status === 404 &&
          err?.message === "No WhatsApp channel found for this workspace"
        ) {
          return [];
        }

        throw error;
      }
    },
    enabled: !!wid && enabled,
    placeholderData: EMPTY_WA_TEMPLATES,
    retry: false,
  });
};
