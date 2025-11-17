"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IAgent } from "@/lib/types/agent";
import { Palette, Bot, Save, Loader2, Upload, Building } from "lucide-react";
import { useRef, useState } from "react";
import { useAgentActions } from "@/lib/hooks/agent/use-agent-actions";
import { getwid } from "@/lib/utils";
import storageService from "@/lib/services/storage-service";
import { toast } from "sonner";
import { ChatPreview } from "@/components/chat/chat-preview";

interface AppearanceTabProps {
  agent: IAgent;
}

export default function AppearanceTab({ agent }: AppearanceTabProps) {
  const [name, setName] = useState(agent.customization.name);
  const [greetingMessage, setGreetingMessage] = useState(
    agent.customization.greetingMessage
  );
  const [primaryColor, setPrimaryColor] = useState(
    agent.customization.primaryColor
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wid = getwid();
  const { updateAgent } = useAgentActions(wid);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let botIconUrl = agent.customization.botIcon;
      botIconUrl = (await uploadLogo()) || botIconUrl;

      const updates = {
        customization: {
          ...agent.customization,
          name,
          greetingMessage,
          primaryColor,
          botIcon: botIconUrl,
        },
      };

      updateAgent.mutate(
        { aid: agent.id, updates },
        {
          onSuccess: () => {
            setLogoFile(null);
            setLogoPreview(null);
          },
          onSettled: () => {
            setIsSaving(false);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to upload logo");
      console.error(error);
      setIsSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadLogo = async () => {
    if (logoFile) {
      const res = await storageService.uploadFile(
        logoFile,
        `w/${wid}/agents/${agent.id}/logo`,
        logoFile.name
      );
      const url = res.downloadURL;
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      return url;
    }
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Agent Appearance Card */}
      <Card className="py-4 h-max">
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Agent Appearance
            </CardTitle>
            <Button
              onClick={handleSave}
              size={"sm"}
              className="rounded-full"
              disabled={isSaving || updateAgent.isPending}
            >
              {isSaving || updateAgent.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter agent name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="greetingMessage">Greeting Message</Label>
                <Textarea
                  id="greetingMessage"
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="Enter greeting message"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="primaryColor">Brand Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="border-t pt-6">
              <div>
                <Label>Brand Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {logoPreview || agent.customization.botIcon ? (
                      <img
                        src={logoPreview || agent.customization.botIcon}
                        alt="Agent avatar"
                        className="w-14 h-14 object-cover"
                      />
                    ) : (
                      <Building className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={isSaving || updateAgent.isPending}
                      className="mt-2"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <ChatPreview
            agent={agent}
            previewName={name}
            previewGreeting={greetingMessage}
            previewPrimaryColor={primaryColor}
            previewBotIcon={logoPreview || agent.customization.botIcon}
          />
        </CardContent>
      </Card>
    </div>
  );
}
