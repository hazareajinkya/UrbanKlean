"use client";

import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatRequestOptions, DefaultChatTransport, UIMessage } from "ai";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { useAgent } from "@/lib/hooks/agent/use-agent";
import { IAgent } from "@/lib/types/agent";
import { v4 } from "uuid";
import { useSession } from "@/lib/hooks/session/use-session";
import { getGreetingMsg, initChat } from "@/components/chat/chat-utils";
import chatService from "@/lib/services/chat-service";
import {
  defaultAImessage,
  defaultUserMessage,
  ISession,
} from "@/lib/types/session";

export default function ChatPage() {
  const { aid } = useParams() as { aid: string };
  const [input, setInput] = useState("");

  const { agent } = useAgent(aid);
  const { session } = useSession(aid);

  const { messages, sendMessage, setMessages, status } = useChat({
    id: session?.id,
    messages: agent ? [getGreetingMsg(agent)] : [],
    transport: new DefaultChatTransport({
      api: "/api/query-stream",
      body: { aid },
    }),

    onError: (error) => {
      console.error("Error: ", error);
      const aimsg = defaultAImessage("Error: " + error.message);
      setMessages((prev) => [...prev, aimsg]);
    },
    onFinish: (messages) => {
      const aimsg = messages.message;
      console.log("aimsg: ", aimsg);

      chatService.saveMessage(aid, session!.id, aimsg);
    },
  });

  const handleChatSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    options: ChatRequestOptions
  ) => {
    e.preventDefault();
    console.log("session1: ", session);

    if (!input.trim() || !aid || !agent) return;

    const msg = defaultUserMessage(input);
    sendMessage({ text: input });
    chatService.saveMessage(aid, session!.id, msg);
    setInput("");
  };

  useEffect(() => {
    if (agent) {
      initChat(agent);
    }
  }, [aid, agent]);

  useEffect(() => {
    if (session) {
      session.messages.length > 0 && setMessages(session.messages);
    }
  }, [session]);

  if (!agent) return <div>Agent not found</div>;
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto overflow-hidden bg-white">
      <ChatHeader agent={agent!} />

      <div className="flex-1 overflow-y-auto">
        <MessageList agent={agent!} messages={messages} status={status} />
      </div>

      <ChatInput
        agent={agent!}
        input={input}
        handleSubmit={handleChatSubmit}
        handleInputChange={(e) => setInput(e.target.value)}
        status={status}
      />
    </div>
  );
}
