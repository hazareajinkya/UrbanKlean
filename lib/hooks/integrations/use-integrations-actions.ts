import { useMutation, useQueryClient } from "@tanstack/react-query";
import shopifyService from "@/lib/services/shopify-service";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { integrationsKey } from "./use-integrations";
import integrationsService from "@/lib/services/integrations-service";
import { actionsKey } from "../actions/use-ai-actions";

export const useIntegrationsActions = () => {
  const qc = useQueryClient();

  const addShopifyIntegration = useMutation({
    mutationFn: shopifyService.addShopifyIntegration,
    onSuccess: (data, variables) => {
      toast.success("Shopify integration added successfully");
      qc.invalidateQueries({ queryKey: integrationsKey(variables.wid) });
    },
    onError: handleError,
  });

  const deleteIntegration = useMutation({
    mutationFn: integrationsService.deleteIntegration,
    onSuccess: (_, variables) => {
      toast.success("Integration deleted successfully");
      qc.invalidateQueries({ queryKey: integrationsKey(variables.wid) });
    },
    onError: handleError,
  });
  const deleteShopifyIntegration = useMutation({
    mutationFn: shopifyService.deleteShopifyIntegration,
    onSuccess: (_, variables) => {
      toast.success("Shopify integration deleted successfully");
      qc.invalidateQueries({ queryKey: integrationsKey(variables.wid) });
      qc.invalidateQueries({ queryKey: actionsKey(variables.wid) });
    },
    onError: handleError,
  });

  const regenerateToken = useMutation({
    mutationFn: shopifyService.regenerateToken,
    onSuccess: (_, variables) => {
      toast.success("Token regenerated successfully");
      qc.invalidateQueries({ queryKey: integrationsKey(variables.wid) });
    },
    onError: handleError,
  });

  const addIntegration = useMutation({
    mutationFn: integrationsService.addIntegration,
    onSuccess: (_, variables) => {
      toast.success("Integration added successfully");
      qc.invalidateQueries({ queryKey: integrationsKey(variables.wid) });
    },
    onError: handleError,
  });

  return {
    addShopifyIntegration,
    addIntegration,
    deleteIntegration,
    regenerateToken,
    deleteShopifyIntegration,
  };
};
