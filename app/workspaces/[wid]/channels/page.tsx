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
import EmailSetupModal from "@/components/channels/email-setup-modal";
import Modal from "@/components/ui/modal";
import { useChannelActions } from "@/hooks/channels/use-channel-actions";
import { useChannels } from "@/hooks/channels/use-channels";
import { fbconf, instaconf, slackconf } from "@/lib/utils/conf";
import { useAgents } from "@/lib/hooks/agent/use-agent";
import {
  InstagramIcon,
  MessengerIcon,
  WAIcon,
  SlackLogo,
  EmailIcon,
} from "@/lib/logos";
import { IAgent } from "@/lib/types/agent";
import { IChannel } from "@/lib/types/channel";
import { getwid } from "@/lib/utils";
import {
  Check,
  Copy,
  Instagram,
  Loader,
  Loader2,
  Settings2,
  SettingsIcon,
  Trash,
  Trash2,
  User,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

const ChannelsPage = () => {
  const { wid } = useParams() as { wid: string };

  const { channels, isLoading } = useChannels(wid);
  const [isEmailSetupModalOpen, setIsEmailSetupModalOpen] = useState(false);

  const handleConnectInstagram = () => {
    const clientId = instaconf.appId;
    const redirectUri = instaconf.redirectUri;
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
    const url = `https://www.facebook.com/${fbconf.version}/dialog/oauth?client_id=${fbconf.appId}&config_id=${configId}&redirect_uri=${fbconf.redirectUri}&response_type=code&state=${wid}`;
    window.open(url, "_blank");
  };

  const handleConnectSlack = () => {
    // Minimal scopes for app mentions only
    const scopes = [
      "app_mentions:read", // Read mentions of the app
      "chat:write", // Send messages to respond to mentions
      "channels:read",
      "channels:history", // Read message history in public channels
      "groups:history", // Read message history in private channels
      "im:history", // Read message history in direct messages
      "mpim:history", // Read message history in group direct messages
      "team:read", // Read team information
    ].join(",");

    const url = `https://slack.com/oauth/v2/authorize?client_id=${slackconf.clientId}&scope=${scopes}&redirect_uri=${slackconf.redirectUri}&state=${wid}`;
    window.open(url, "_blank");
  };

  const handleConnectEmail = () => {
    setIsEmailSetupModalOpen(true);
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
        <Button
          onClick={handleConnectSlack}
          variant="outline"
          className="bg-card"
        >
          <SlackLogo className="w-5 h-5" />
          <span>Connect Slack</span>
        </Button>
        <Button
          onClick={handleConnectEmail}
          variant="outline"
          className="bg-card"
        >
          <EmailIcon className="w-5 h-5" />
          <span>Connect Email</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin" />
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
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <SlackLogo className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No channels connected</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Connect your social media accounts to start managing conversations
            from one place.
          </p>
        </div>
      )}

      {isEmailSetupModalOpen && (
        <EmailSetupModal
          isOpen={isEmailSetupModalOpen}
          closeModal={() => setIsEmailSetupModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ChannelsPage;

const ChannelCard = ({ channel }: { channel: IChannel }) => {
  const { disconnectChannel, assignChannelToAgent, unassignChannelFromAgent } =
    useChannelActions();
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
    if (channel.provider === "email") {
      return <EmailIcon className="w-5 h-5 text-primary" />;
    }
    if (channel.provider === "whatsapp") {
      return <WAIcon className="w-5 h-5 text-primary" />;
    }
    if (channel.provider === "slack") {
      return info.teamIcon ? (
        <img
          src={info.teamIcon}
          className="w-11 h-11 text-primary object-cover rounded-md"
          alt={info.teamName}
        />
      ) : (
        <SlackLogo className="w-5 h-5 text-primary" />
      );
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
    if (channel.provider === "email") {
      return info.name;
    }
    if (channel.provider === "slack") {
      return info.teamName || "Slack Workspace";
    }
  };

  const descriptionText = () => {
    if (channel.provider === "instagram") {
      return info.username;
    }
    if (channel.provider === "messenger") {
      return "Facebook Page";
    }
    if (channel.provider === "email") {
      return info.email;
    }
    if (channel.provider === "slack") {
      return `@${info.bot_user_id || "slack-bot"}`;
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
    unassignChannelFromAgent.mutate({
      wid,
      channelId: channel.id,
      agentId: channel.assignedAgentId,
    });
  };

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  const handleCopyForwardingEmail = async () => {
    const fwdEmail = info.forwardingEmail;
    if (!fwdEmail) return;

    try {
      await navigator.clipboard.writeText(fwdEmail);
      setCopiedEmail(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleSettingsClick = () => {
    if (channel.provider === "email") {
      setShowEmailSettings(true);
    }
  };

  return (
    <>
      <Card className="gap-4">
        <CardContent className="">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {providerIcon()}
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-sm mb-0.5">{titleText()}</h3>
              <p className="text-xs text-muted-foreground ">
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
              onClick={handleSettingsClick}
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
                    <Loader className="w-4 h-4 animate-spin" />
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
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>

            {channel.provider === "instagram" && (
              <InstagramIcon className="w-4 h-4" />
            )}
            {channel.provider === "email" && <EmailIcon className="w-4 h-4" />}
            {channel.provider === "messenger" && (
              <MessengerIcon className="w-4 h-4" />
            )}
            {channel.provider === "whatsapp" && <WAIcon className="w-4 h-4" />}
            {channel.provider === "slack" && <SlackLogo className="w-4 h-4" />}
          </div>
        </CardFooter>
      </Card>

      {/* Email Settings Modal */}
      {showEmailSettings && channel.provider === "email" && (
        <EmailChannelSettingsModal
          isOpen={showEmailSettings}
          onClose={() => setShowEmailSettings(false)}
          forwardingEmail={info.forwardingEmail}
          channelName={info.name}
          onCopy={handleCopyForwardingEmail}
          copied={copiedEmail}
        />
      )}
    </>
  );
};

interface EmailChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forwardingEmail: string;
  channelName: string;
  onCopy: () => void;
  copied: boolean;
}

const EmailChannelSettingsModal = ({
  isOpen,
  onClose,
  forwardingEmail,
  channelName,
  onCopy,
  copied,
}: EmailChannelSettingsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="max-w-md bg-background rounded-xl p-6 shadow-xl"
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Email settings</h2>
          <p className="text-sm text-muted-foreground">{channelName}</p>
        </div>

        <div className="space-y-3">
          <Label>Forwarding address</Label>
          <div className="flex gap-2">
            <div
              className="flex-1 px-3 py-2.5 bg-muted rounded-lg font-mono text-sm cursor-text select-all break-all"
              onClick={onCopy}
              role="button"
              tabIndex={0}
              aria-label="Click to copy forwarding email"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onCopy();
              }}
            >
              {forwardingEmail}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onCopy}
              aria-label="Copy forwarding email"
              tabIndex={0}
              className="shrink-0"
            >
              {copied ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Forward your incoming emails to this address to receive them in
            MagicalCX.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="w-full" tabIndex={0}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
