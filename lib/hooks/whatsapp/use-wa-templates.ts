import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/clients/axios-client";
import { IWaTemplate } from "@/lib/types/wa-api";

export const waTemplatesKey = () => ["wa-templates"] as const;
export const waTemplateKey = (wid: string) => ["wa-templates", wid] as const;

export const useWaTemplates = (wid: string) => {
  return useQuery({
    queryKey: waTemplateKey(wid),
    queryFn: async (): Promise<IWaTemplate[]> => {
      const response = await apiClient.get(`/api/wa-templates?wid=${wid}`);
      return response.data.data;
    },
    enabled: !!wid,
  });
};
