"use client";

import { useState } from "react";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { IAgent } from "@/lib/types/agent";
import { IChatMessage } from "@/lib/types/session";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatPreviewProps {
  agent: IAgent;
  previewName?: string;
  previewGreeting?: string;
  previewPrimaryColor?: string;
  previewBotIcon?: string;
}

export const ChatPreview = ({
  agent,
  previewName,
  previewGreeting,
  previewPrimaryColor,
  previewBotIcon,
}: ChatPreviewProps) => {
  const [previewInput] = useState("");

  // Create a preview agent with updated customization
  const previewAgent: IAgent = {
    ...agent,
    customization: {
      ...agent.customization,
      name: previewName || agent.customization.name,
      greetingMessage: previewGreeting || agent.customization.greetingMessage,
      primaryColor: previewPrimaryColor || agent.customization.primaryColor,
      botIcon: previewBotIcon || agent.customization.botIcon,
    },
  };

  // Create sample messages for the preview
  const sampleMessages: IChatMessage[] = [
    {
      id: "greeting-preview",
      role: "assistant",
      metadata: {
        createdAt: new Date().toISOString(),
      },
      parts: [
        {
          type: "text",
          text: previewAgent.customization.greetingMessage,
        },
      ],
    },
    {
      id: "user-sample-1",
      role: "user",
      metadata: {
        createdAt: new Date().toISOString(),
      },
      parts: [
        {
          type: "text",
          text: "Hi there! Can you help me with my order?",
        },
      ],
    },
    {
      id: "assistant-sample-1",
      role: "assistant",
      metadata: {
        createdAt: new Date().toISOString(),
      },
      parts: [
        {
          type: "text",
          text: "Of course! I'd be happy to help you with your order. Could you please provide me with your order number or the email address associated with your account?",
        },
      ],
    },
    {
      id: "user-sample-2",
      role: "user",
      metadata: {
        createdAt: new Date().toISOString(),
      },
      parts: [
        {
          type: "text",
          text: "My order number is #12345",
        },
      ],
    },
    {
      id: "assistant-sample-2",
      role: "assistant",
      metadata: {
        createdAt: new Date().toISOString(),
      },
      parts: [
        {
          type: "text",
          text: "Thank you! Let me look up order #12345 for you. I can see that your order is currently being processed and should ship within the next 24 hours. You'll receive a tracking number via email once it's on its way.",
        },
      ],
    },
  ];

  // Disabled handlers for preview mode
  const handlePreviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Do nothing in preview mode
  };

  const handlePreviewInputChange = () => {
    // Do nothing in preview mode
  };

  return (
    <div className="mx-auto h-full max-w-[420px] max-h-[600px] flex flex-col overflow-hidden bg-white relative border rounded-lg">
      <ChatHeader agent={previewAgent} isWidget={false} />

      <div className="flex-1 overflow-y-auto">
        <MessageList
          agent={previewAgent}
          messages={sampleMessages}
          status="ready"
        />
      </div>

      {/* Scroll to bottom button - disabled in preview */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.3 }}
          className="absolute bottom-24 right-4 pointer-events-none"
        >
          <Button
            size="icon"
            variant="outline"
            className="w-8 h-8 text-muted-foreground rounded-full shadow-lg opacity-50"
            disabled
          >
            <ArrowDown className="w-3 h-3" />
          </Button>
        </motion.div>
      </AnimatePresence>

      {/* Preview overlay to indicate it's not interactive */}
      <div className="absolute inset-0 bg-transparent pointer-events-none" />

      <div className="relative">
        <ChatInput
          agent={previewAgent}
          input={previewInput}
          handleSubmit={handlePreviewSubmit}
          handleInputChange={handlePreviewInputChange}
          status="ready"
          isWidget={false}
        />
        {/* Overlay on input to make it non-interactive */}
        <div className="absolute inset-0 bg-transparent cursor-not-allowed" />
      </div>

      {/* Preview indicator */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
        Preview
      </div>
    </div>
  );
};
