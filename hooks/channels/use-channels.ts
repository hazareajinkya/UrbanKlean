import channelService from "@/lib/services/channel-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const channelsKey = (wid: string) => ["channels", wid];
export const channelKey = (wid: string, channelId: string) => [
  "channels",
  wid,
  channelId,
];
export const useChannels = (wid: string) => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: channelsKey(wid),
    queryFn: () =>
      channelService.getChannels(wid).then((channels) => {
        channels.map((channel) =>
          qc.setQueryData(channelKey(wid, channel.id), channel)
        );
        return channels;
      }),
  });

  return {
    channels: query.data!,
    ...query,
  };
};

export const useChannel = (wid: string, channelId: string) => {
  const query = useQuery({
    queryKey: channelKey(wid, channelId),
    queryFn: () => channelService.getChannel(wid, channelId),
  });

  return {
    channel: query.data,
    ...query,
  };
};
