import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/clients/axios-client";
import {
  GeneratePolicyInput,
  GeneratePolicyOutput,
} from "@/app/api/free-tools/generate-policy/schema";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const usePolicyGenerator = () => {
  return useMutation<
    ApiResponse<GeneratePolicyOutput>, // Response type
    Error, // Error type
    GeneratePolicyInput // Variables type
  >({
    mutationFn: async (input) => {
      const response = await apiClient.post<ApiResponse<GeneratePolicyOutput>>(
        "/api/free-tools/generate-policy",
        input,
      );
      return response.data;
    },
  });
};
