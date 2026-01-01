"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { models } from "@/lib/models";
import { IAgent } from "@/lib/types/agent";
import { Settings, Save, FileText, Brain, Loader, Folder } from "lucide-react";
import { useState } from "react";
import { GoogleLogo, OpenAIIcon } from "@/lib/logos";
import { useAgentActions } from "@/lib/hooks/agent/use-agent-actions";
import { getwid } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useFolders } from "@/lib/hooks/folders/use-folders";

interface SettingsTabProps {
  agent: IAgent;
}

export default function SettingsTab({ agent }: SettingsTabProps) {
  const [model, setModel] = useState(agent.settings.model);
  const [temperature, setTemperature] = useState(agent.settings.temperature);
  const [systemPrompt, setSystemPrompt] = useState(agent.settings.systemPrompt);
  const [knowledgeFolders, setKnowledgeFolders] = useState<string[]>(
    agent.knowledgeFolders || []
  );

  const wid = getwid();
  const { updateAgent } = useAgentActions(wid);
  const { data: folders } = useFolders(wid);

  const handleSave = () => {
    updateAgent.mutate({
      aid: agent.id,
      updates: {
        settings: {
          ...agent.settings,
          model,
          temperature: temperature,
          systemPrompt,
        },
        knowledgeFolders,
      },
    });
  };

  const handleFolderToggle = (folderId: string) => {
    setKnowledgeFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const router = useRouter();

  return (
    <div className="p-4">
      {/* AI Model Configuration */}

      <div className="">
        <Card className="gap-0 pb-0">
          <CardHeader className="border-b pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Model Configuration
              </CardTitle>
              <Button
                onClick={handleSave}
                size="sm"
                className="rounded-full px-4"
                disabled={updateAgent.isPending}
              >
                {updateAgent.isPending && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 col-span-1 h-max">
            <div className="col-span-1 py-6 md:border-r">
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="model">AI Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="mt-2 w-full">
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((modelOption) => (
                          <SelectItem
                            key={modelOption.value}
                            value={modelOption.value}
                          >
                            <div className="flex items-center gap-2">
                              {modelOption.provider === "openai" ? (
                                <OpenAIIcon className="w-4 h-4" />
                              ) : (
                                <GoogleLogo className="w-4 h-4" />
                              )}
                              {modelOption.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="temperature">
                      Temperature ({temperature})
                    </Label>
                    <Slider
                      value={[temperature]}
                      onValueChange={(value) => {
                        if (value.length > 0) setTemperature(value[0]);
                      }}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-4"
                    />
                    <div className="grid grid-cols-3 justify-between text-xs text-muted-foreground mt-3">
                      <span className="mr-auto">Conservative (0)</span>
                      <span className="mx-auto">Balanced (0.5)</span>
                      <span className="ml-auto">Creative (1)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Lower values make responses more focused and
                      deterministic.
                    </p>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex items-start justify-between mb-0">
                      <div>
                        <Label>Knowledge Base Access</Label>
                      </div>
                      {knowledgeFolders.length > 0 && (
                        <p className="text-xs text-muted-foreground self-center">
                          {knowledgeFolders.length} selected
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Select folders this agent can access.
                    </p>
                    {folders && folders.length > 0 ? (
                      <div className="space-y-2">
                        {folders.map((folder) => {
                          const isSelected = knowledgeFolders.includes(
                            folder.id
                          );
                          return (
                            <div
                              key={folder.id}
                              onClick={() => handleFolderToggle(folder.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? "hover:bg-accent/50 hover:border-accent-foreground/20 bg-accent/50"
                                  : "border-border hover:bg-accent/50 hover:border-accent-foreground/20"
                              }`}
                            >
                              <Checkbox
                                id={`folder-${folder.id}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleFolderToggle(folder.id)
                                }
                                className="pointer-events-none"
                              />
                              <label
                                htmlFor={`folder-${folder.id}`}
                                className="flex-1 cursor-pointer flex items-center gap-2 text-sm font-medium"
                              >
                                <Folder
                                  className={`w-4 h-4 ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                                <span
                                  className={
                                    isSelected
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {folder.name}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed rounded-lg text-center bg-muted/30">
                        <Folder className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-xs text-muted-foreground">
                          No folders available. Create folders in Knowledge Base
                          first.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>

            {/* System Prompt */}
            <div className="col-span-2 py-6">
              <CardContent>
                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter instructions that define how your agent should behave..."
                    rows={8}
                    className="mt-2 min-h-[150px] max-h-[62vh]"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    This prompt defines your agent's personality, knowledge, and
                    behavior. Be specific about how the agent should respond to
                    different types of questions.
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
