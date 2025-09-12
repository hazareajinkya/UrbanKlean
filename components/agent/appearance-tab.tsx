"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IAgent } from "@/lib/types/agent";
import { Palette, Bot, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAgentActions } from "@/lib/hooks/agent/use-agent-actions";
import { getwid } from "@/lib/utils";

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

  const wid = getwid();
  const { updateAgent } = useAgentActions(wid);

  const handleSave = () => {
    updateAgent.mutate({
      aid: agent.id,
      updates: {
        customization: {
          ...agent.customization,
          name,
          greetingMessage,
          primaryColor,
        },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agent Appearance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Agent Appearance
            </CardTitle>
            <Button
              onClick={handleSave}
              size={"sm"}
              disabled={updateAgent.isPending}
            >
              {updateAgent.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 " />
              )}
              Save Changes
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
                <Label>Avatar</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {agent.customization.botIcon ? (
                      <img
                        src={agent.customization.botIcon}
                        alt="Agent avatar"
                        className="w-14 h-14"
                      />
                    ) : (
                      <Bot className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avatar customization coming soon
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="mt-2"
                    >
                      Upload New Avatar
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
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {agent.customization.botIcon ? (
                    <img
                      src={agent.customization.botIcon}
                      alt="Agent avatar"
                      className="w-8 h-8"
                    />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{name || "Agent Name"}</h3>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm">
                  {greetingMessage || "Hello! How can I help you today?"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
