"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChannelActions } from "@/hooks/channels/use-channel-actions";
import { useChannels } from "@/hooks/channels/use-channels";
import {
  FB_APP_ID,
  FB_REDIRECT_URI,
  INSTAGRAM_APP_ID,
  INSTAGRAM_REDIRECT_URI,
} from "@/lib/constants";
import { useAgents } from "@/lib/hooks/agent/use-agent";
import { InstagramIcon, MessengerIcon, WAIcon } from "@/lib/logos";
import { IAgent } from "@/lib/types/agent";
import { IChannel } from "@/lib/types/channel";
import { getwid } from "@/lib/utils";
import {
  Instagram,
  Loader2,
  Settings2,
  SettingsIcon,
  Trash,
  Trash2,
  User,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ChannelsPage = () => {
  const router = useRouter();
  const { wid } = useParams() as { wid: string };

  const { channels, isLoading } = useChannels(wid);

  const handleConnectInstagram = () => {
    const clientId = INSTAGRAM_APP_ID;
    const redirectUri = INSTAGRAM_REDIRECT_URI;
    const scopes = [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
      "instagram_business_manage_insights",
    ].join(",");
    console.log("scopes: ", scopes);

    const url = `https://www.instagram.com/oauth/authorize?force_reauth=false&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${wid}`;

    console.log("url: ", url);

    window.open(url, "_blank");
  };

  const handleConnectFB = () => {
    const configId = "793606190090300";
    const url = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${FB_APP_ID}&config_id=${configId}&redirect_uri=${FB_REDIRECT_URI}&response_type=code&state=${wid}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl ">Channels</h1>
        <p className="text-sm text-muted-foreground">
          Connect your social media channels to manage them from one place.
        </p>
      </div>
      <div className="space-x-2">
        <Button
          onClick={handleConnectInstagram}
          variant="outline"
          className="bg-card"
        >
          <InstagramIcon className="w-5 h-5" />
          <span>Connect Instagram</span>
        </Button>
        <Button onClick={handleConnectFB} variant="outline" className="bg-card">
          <MessengerIcon className="w-5 h-5" />
          <span>Connect Facebook</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : channels && channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex flex-row items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <InstagramIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessengerIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <WAIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No channels connected</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Connect your social media accounts to start managing conversations
            from one place.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;

const ChannelCard = ({ channel }: { channel: IChannel }) => {
  const { disconnectChannel, assignChannelToAgent } = useChannelActions();
  const { data: agents } = useAgents(getwid());
  const [showAgentSelect, setShowAgentSelect] = useState(false);

  const info = channel.metadata;
  const wid = getwid();

  const providerIcon = () => {
    if (channel.provider === "instagram") {
      return (
        <img
          src={info.profile_picture_url}
          className="w-11 h-11 text-primary object-cover rounded-md"
          alt={info.name}
        />
      );
    }
    if (channel.provider === "messenger") {
      return (
        <img
          src={info.profile_pic}
          className="w-11 h-11 text-primary object-cover rounded-md"
          alt={info.name}
        />
      );
    }
    if (channel.provider === "whatsapp") {
      return <WAIcon className="w-5 h-5 text-primary" />;
    }
  };

  const titleText = () => {
    if (channel.provider === "instagram") {
      return info.name;
    }
    if (channel.provider === "messenger") {
      return info.name;
    }
    if (channel.provider === "whatsapp") {
      return info.name;
    }
  };

  const descriptionText = () => {
    if (channel.provider === "instagram") {
      return info.username;
    }
    if (channel.provider === "messenger") {
      return "Facebook Page";
    }
  };

  // Get available agents (not assigned to any channel)
  const availableAgents =
    agents?.filter(
      (agent: IAgent) => !agent.channels || agent.channels.length === 0
    ) || [];

  // Get currently assigned agent
  const assignedAgent = agents?.find(
    (agent) => agent.id === channel.assignedAgentId
  );

  const handleAssignAgent = (agentId: string) => {
    assignChannelToAgent.mutate({
      wid,
      channelId: channel.id,
      agentId,
    });
    setShowAgentSelect(false);
  };

  const handleUnassignAgent = () => {
    // You'll need to implement unassign functionality in your service
    assignChannelToAgent.mutate({
      wid,
      channelId: channel.id,
      agentId: "",
    });
  };

  return (
    <Card className="gap-4">
      <CardContent className="">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            {providerIcon()}
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-sm mb-0.5">{titleText()}</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {descriptionText()}
            </p>
            {assignedAgent && (
              <div className="flex items-center gap-1 mt-1">
                <User className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-600">
                  {assignedAgent.customization.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="icon"
            className="w-min h-min"
            onClick={() => {}}
          >
            <Settings2 className="w-4 h-4" />
          </Button>

          {/* Agent Assignment Dropdown */}
          <DropdownMenu
            open={showAgentSelect}
            onOpenChange={setShowAgentSelect}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-min"
                disabled={assignChannelToAgent.isPending}
              >
                {assignChannelToAgent.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Assign Agent</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {assignedAgent && (
                <>
                  <DropdownMenuItem
                    onClick={handleUnassignAgent}
                    className="text-red-600"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unassign {assignedAgent.customization.name}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {availableAgents.length > 0 ? (
                availableAgents.map((agent) => (
                  <DropdownMenuItem
                    key={agent.id}
                    onClick={() => handleAssignAgent(agent.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {agent.customization.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No available agents
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-min"
            onClick={() =>
              disconnectChannel.mutate({
                wid: wid,
                channelId: channel.id,
                provider: channel.provider,
              })
            }
          >
            {disconnectChannel.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>

          {channel.provider === "instagram" && (
            <InstagramIcon className="w-4 h-4" />
          )}
          {channel.provider === "messenger" && (
            <MessengerIcon className="w-4 h-4" />
          )}
          {channel.provider === "whatsapp" && <WAIcon className="w-4 h-4" />}
        </div>
      </CardFooter>
    </Card>
  );
};
