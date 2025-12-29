import axiosClient from "@/lib/clients/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { channelsKey } from "./use-channels";
import { IChannelProvider } from "@/lib/types/channel";
import channelService from "@/lib/services/channel-service";

export const useChannelActions = () => {
  const qc = useQueryClient();

  const assignChannelToAgent = useMutation({
    mutationFn: async ({
      wid,
      channelId,
      agentId,
    }: {
      wid: string;
      channelId: string;
      agentId: string;
    }) => {
      await channelService.assignAgentToChannel(wid, channelId, agentId);
    },
    onSuccess: (_, variables) => {
      const { wid } = variables;
      toast.success("Channel assigned to agent successfully");
      qc.invalidateQueries({ queryKey: channelsKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const unassignChannelFromAgent = useMutation({
    mutationFn: async ({
      wid,
      channelId,
      agentId,
    }: {
      wid: string;
      channelId: string;
      agentId: string;
    }) => {
      await channelService.unassignAgentFromChannel(wid, channelId, agentId);
    },
    onSuccess: (_, variables) => {
      const { wid } = variables;
      toast.success("Channel unassigned from agent successfully");
      qc.invalidateQueries({ queryKey: channelsKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const disconnectChannel = useMutation({
    mutationFn: async ({
      wid,
      channelId,
      provider,
    }: {
      wid: string;
      channelId: string;
      provider: IChannelProvider;
    }) => {
      const routePath = provider === "messenger" ? "facebook" : provider;

      await axiosClient.delete(
        `/api/oauth/${routePath}?wid=${wid}&channelId=${channelId}`
      );
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
    onSuccess: (_, { wid }) => {
      toast.success("Channel disconnected successfully");
      qc.invalidateQueries({ queryKey: channelsKey(wid) });
    },
  });

  const createWhatsappChannel = useMutation({
    mutationFn: async ({
      wid,
      phone_number_id,
      waba_id,
      business_id,
      authorizationCode,
    }: {
      wid: string;
      phone_number_id: string;
      waba_id: string;
      business_id: string;
      authorizationCode: string;
    }) => {
      await axiosClient.post("/api/oauth/whatsapp", {
        wid,
        phone_number_id,
        waba_id,
        business_id,
        authorizationCode,
      });
    },
    onSuccess: (_, variables) => {
      const { wid } = variables;
      toast.success("WhatsApp channel created successfully");
      qc.invalidateQueries({ queryKey: channelsKey(wid) });
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  return {
    disconnectChannel,
    assignChannelToAgent,
    unassignChannelFromAgent,
    createWhatsappChannel,
  };
};
