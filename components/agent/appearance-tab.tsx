"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { IAgent } from "@/lib/types/agent";
import { Loader, Upload, Building, Plus, X, GripVertical } from "lucide-react";
import { useRef, useState } from "react";
import { useAgentActions } from "@/lib/hooks/agent/use-agent-actions";
import { getwid } from "@/lib/utils";
import storageService from "@/lib/services/storage-service";
import { toast } from "sonner";
import { ChatPreview } from "@/components/chat/chat-preview";

interface AppearanceTabProps {
  agent: IAgent;
}

const MAX_STARTER_MESSAGES = 5;

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
  const [isSavingStarters, setIsSavingStarters] = useState(false);

  // Drag state for reordering
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Starter messages state
  const [starterMessagesEnabled, setStarterMessagesEnabled] = useState(
    agent.customization.starterMessagesEnabled ?? false
  );
  const [starterMessages, setStarterMessages] = useState<string[]>(
    agent.customization.starterMessages ?? []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wid = getwid();
  const { updateAgent } = useAgentActions(wid);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let botIconUrl = agent.customization.botIcon;
      botIconUrl = (await uploadLogo()) || botIconUrl;

      // Filter out empty starter messages

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

  const handleSaveStarterMessages = () => {
    setIsSavingStarters(true);

    const filteredStarterMessages = starterMessages.filter(
      (msg) => msg.trim() !== ""
    );

    const updates = {
      customization: {
        ...agent.customization,
        starterMessagesEnabled,
        starterMessages: filteredStarterMessages,
      },
    };

    updateAgent.mutate(
      { aid: agent.id, updates },
      {
        onSuccess: () => {
          setStarterMessages(filteredStarterMessages);
        },
        onSettled: () => {
          setIsSavingStarters(false);
        },
      }
    );
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

  // Starter messages handlers
  const handleAddStarterMessage = () => {
    if (starterMessages.length < MAX_STARTER_MESSAGES) {
      setStarterMessages([...starterMessages, ""]);
    }
  };

  const handleRemoveStarterMessage = (index: number) => {
    setStarterMessages(starterMessages.filter((_, i) => i !== index));
  };

  const handleStarterMessageChange = (index: number, value: string) => {
    const updated = [...starterMessages];
    updated[index] = value;
    setStarterMessages(updated);
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const updated = [...starterMessages];
    const [draggedItem] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, draggedItem);
    setStarterMessages(updated);
    setDragIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // Create preview agent with current state
  const previewAgent: IAgent = {
    ...agent,
    customization: {
      ...agent.customization,
      name,
      greetingMessage,
      primaryColor,
      botIcon: logoPreview || agent.customization.botIcon,
      starterMessagesEnabled,
      starterMessages: starterMessages.filter((msg) => msg.trim() !== ""),
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Settings Column */}
      <div className="space-y-6">
        {/* Agent Appearance Card */}
        <Card className="py-4">
          <CardHeader>
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
                  <Loader className="w-4 h-4 animate-spin" />
                ) : null}
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Brand Logo Section - Moved to top */}
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
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
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
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1>Starter Messages</h1>
                    <Switch
                      checked={starterMessagesEnabled}
                      onCheckedChange={setStarterMessagesEnabled}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Show quick suggestions when users start a new conversation
                </p>
              </div>
              <div className="space-y-2">
                {starterMessages.map((message, index) => (
                  <div
                    key={index}
                    draggable={starterMessagesEnabled}
                    onDragStart={() =>
                      starterMessagesEnabled && handleDragStart(index)
                    }
                    onDragOver={(e) =>
                      starterMessagesEnabled && handleDragOver(e, index)
                    }
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all group
                      ${
                        dragIndex === index
                          ? "bg-primary/10 border-2 border-dashed border-primary/40"
                          : "bg-muted/30 hover:bg-muted/50"
                      } ${!starterMessagesEnabled ? "opacity-50" : ""}`}
                  >
                    {/* Drag handle */}
                    <div
                      className={`text-muted-foreground p-1 ${
                        starterMessagesEnabled
                          ? "cursor-grab active:cursor-grabbing hover:text-foreground"
                          : "cursor-not-allowed opacity-50"
                      }`}
                      title={
                        starterMessagesEnabled ? "Drag to reorder" : "Disabled"
                      }
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Input field */}
                    <Input
                      value={message}
                      disabled={!starterMessagesEnabled}
                      onChange={(e) =>
                        handleStarterMessageChange(index, e.target.value)
                      }
                      placeholder={`e.g. "How can I get started?"`}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-100"
                    />

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!starterMessagesEnabled}
                      onClick={() => handleRemoveStarterMessage(index)}
                      className={`h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity ${
                        starterMessagesEnabled
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-0 cursor-not-allowed"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {starterMessages.length < MAX_STARTER_MESSAGES && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!starterMessagesEnabled}
                    onClick={handleAddStarterMessage}
                    className="w-full mt-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Message ({starterMessages.length}/{MAX_STARTER_MESSAGES}
                    )
                  </Button>
                )}

                {starterMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add up to {MAX_STARTER_MESSAGES} starter messages for your
                    users
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card className="h-max">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <ChatPreview
            agent={previewAgent}
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
