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
import { IAgent } from "@/lib/types/agent";
import { Settings, Save, FileText, Brain, Loader2 } from "lucide-react";
import { useState } from "react";
import { GoogleLogo, OpenAIIcon } from "@/lib/logos";
import { useAgentActions } from "@/lib/hooks/agent/use-agent-actions";
import { getwid } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";

interface SettingsTabProps {
  agent: IAgent;
}

export default function SettingsTab({ agent }: SettingsTabProps) {
  const [model, setModel] = useState(agent.settings.model);
  const [temperature, setTemperature] = useState(agent.settings.temperature);
  const [systemPrompt, setSystemPrompt] = useState(agent.settings.systemPrompt);

  const wid = getwid();
  const { updateAgent } = useAgentActions(wid);

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
      },
    });
  };

  const models = [
    { value: "gpt-4.1", label: "GPT-4.1", provider: "openai" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", provider: "openai" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano", provider: "openai" },
    {
      value: "gemini-2.5-pro",
      label: "Gemini 2.5 Pro",
      provider: "google",
    },
    {
      value: "gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      provider: "google",
    },

    {
      value: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      provider: "google",
    },
  ];

  const router = useRouter();

  return (
    <div className="">
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
                size={"sm"}
                className="rounded-full px-4"
                disabled={updateAgent.isPending}
              >
                {updateAgent.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
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
                    <div className="grid grid-cols-3 justify-between text-xs text-muted-foreground mt-2">
                      <span className="mr-auto">Conservative (0)</span>
                      <span className="mx-auto">Balanced (0.5)</span>
                      <span className="ml-auto">Creative (1)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Lower values make responses more focused and
                      deterministic.
                    </p>
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
