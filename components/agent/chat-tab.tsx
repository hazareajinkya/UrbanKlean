"use client";

import { IAgent } from "@/lib/types/agent";
import { MessageCircle, Smartphone, Users, Zap, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChatTabProps {
  agent: IAgent;
}

export default function ChatTab({ agent }: ChatTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-9 place-items-center ">
      {/* Left Column - Mobile Chat Widget */}
      <div className="flex justify-center lg:justify-start">
        <div className="relative">
          {/* Mobile device frame */}
          <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl">
            <div className="bg-white rounded-xl overflow-hidden">
              <iframe
                src={`/chat/${agent.id}`}
                className="w-[355px] h-[647px] border-0"
                title={`Chat interface for ${agent.customization.name}`}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Description and Features */}
      <Card className="h-max">
        <CardHeader className="mb-2">
          <CardTitle className="font-medium text-lg">
            Live Chat Preview
          </CardTitle>
          <CardDescription className="text-muted-foreground leading-6">
            Experience your AI agent in action with this live chat interface.
            This is exactly how your customers will interact with{" "}
            {agent.customization.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-8">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 mt-1 text-blue-600" />
              <div>
                <h3 className="mb-1">Mobile Optimized</h3>
                <p className="text-sm text-muted-foreground">
                  Designed to work perfectly on mobile devices with responsive
                  design and touch-friendly interface.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 mt-1 text-yellow-600" />
              <div>
                <h3 className="mb-1">Real-time Responses</h3>
                <p className="text-sm text-muted-foreground">
                  Powered by advanced AI, your agent provides instant,
                  contextual responses to customer queries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 mt-1 text-green-600" />
              <div>
                <h3 className="mb-1">24/7 Availability</h3>
                <p className="text-sm text-muted-foreground">
                  Your AI agent is always ready to help customers, providing
                  support around the clock.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 mt-1 text-purple-600" />
              <div>
                <h3 className="mb-1">Knowledge-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Trained on your knowledge base to provide accurate, relevant
                  information specific to your business.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
