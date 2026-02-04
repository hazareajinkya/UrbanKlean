import storageService from "./storage-service";
import axiosClient from "@/lib/clients/axios-client";
import agentService from "./agent-service";
import { IAgent } from "@/lib/types/agent";

export interface UpdateAppearanceParams {
    name: string;
    greetingMessage: string;
    primaryColor: string;
    botIcon: string | null;
    logoFile: File | null;
    starterMessagesEnabled: boolean;
    starterMessages: string[];
}

class AppearanceService {

    async uploadAgentLogo(wid: string, agentId: string, file: File) {
        const res = await storageService.uploadFile(
            file,
            `w/${wid}/agents/${agentId}/logo`,
            file.name
        );
        return res.downloadURL;
    }


    async generateConversationStarters(agentId: string) {
        const { data } = await axiosClient.post(
            `/api/agents/${agentId}/conversation-starters/generate`
        );

        if (data?.data?.starters && Array.isArray(data.data.starters)) {
            return data.data.starters; // Return just the starters array
        }

        throw new Error("Invalid response format from generation API");
    }

    async updateAppearance({
        wid,
        aid,
        currentCustomization,
        params,
    }: {
        wid: string;
        aid: string;
        currentCustomization: IAgent["customization"];
        params: UpdateAppearanceParams;
    }) {
        let botIconUrl = params.botIcon || currentCustomization.botIcon;

        if (params.logoFile) {
            botIconUrl = await this.uploadAgentLogo(wid, aid, params.logoFile);
        }

        const updates = {
            customization: {
                ...currentCustomization,
                name: params.name,
                greetingMessage: params.greetingMessage,
                primaryColor: params.primaryColor,
                botIcon: botIconUrl,
                starterMessagesEnabled: params.starterMessagesEnabled,
                starterMessages: params.starterMessages.filter((msg) => msg.trim() !== ""),
            },
        };

        return agentService.updateAgent({ aid, updates });
    }
}

const appearanceService = new AppearanceService();
export default appearanceService;
