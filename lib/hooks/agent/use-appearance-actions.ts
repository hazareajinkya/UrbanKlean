import { useMutation, useQueryClient } from "@tanstack/react-query";
import appearanceService, { UpdateAppearanceParams } from "@/lib/services/appearance-service";
import { IAgent } from "@/lib/types/agent";
import { toast } from "sonner";
import { agentKey, agentsKey } from "./use-agent";

export const useAppearanceActions = (agent: IAgent) => {
    const qc = useQueryClient();

    const generateStarters = useMutation({
        mutationFn: () => appearanceService.generateConversationStarters(agent.id),
        onSuccess: (starters) => {
            toast.success("Conversation starters generated!");
        },
        onError: (error: any) => {
            console.error("Failed to generate starters:", error);
            toast.error(
                error?.response?.data?.message || "Failed to generate conversation starters"
            );
        },
    });

    const updateAppearance = useMutation({
        mutationFn: (params: UpdateAppearanceParams) =>
            appearanceService.updateAppearance({
                wid: agent.wid,
                aid: agent.id,
                currentCustomization: agent.customization,
                params,
            }),
        onSuccess: () => {
            toast.success("Appearance saved successfully");
            qc.invalidateQueries({ queryKey: agentKey(agent.id) });
            qc.invalidateQueries({ queryKey: agentsKey(agent.wid) });
        },
        onError: (error) => {
            console.error("Failed to save appearance:", error);
            toast.error("Failed to save appearance");
        },
    });

    return {
        generateStarters,
        saveAppearance: updateAppearance.mutateAsync,
        isSaving: updateAppearance.isPending,
    };
};
