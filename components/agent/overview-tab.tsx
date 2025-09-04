"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IAgent } from "@/lib/types/agent";
import { formatDate } from "@/lib/utils";
import { Bot, Calendar, Thermometer, Brain } from "lucide-react";

interface OverviewTabProps {
  agent: IAgent;
}

export default function OverviewTab({ agent }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Agent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agent Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Agent Name
              </label>
              <p className="text-base">{agent.customization.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Model
              </label>
              <p className="text-base">{agent.settings.model}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Temperature
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {agent.settings.temperature}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {agent.settings.temperature < 0.3
                    ? "Conservative"
                    : agent.settings.temperature < 0.7
                    ? "Balanced"
                    : "Creative"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="text-base">{formatDate(agent.createdAt)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Greeting Message
            </label>
            <p className="text-base mt-1">
              {agent.customization.greetingMessage}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Thermometer className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDate(agent.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Prompt Preview */}
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          {agent.settings.systemPrompt ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">
                {agent.settings.systemPrompt}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              No system prompt configured
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
