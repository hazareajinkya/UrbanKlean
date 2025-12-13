"use client";

import { useChat } from "@ai-sdk/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DefaultChatTransport, ToolUIPart } from "ai";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { useAgent } from "@/lib/hooks/agent/use-agent";
import {
  chatInitKey,
  getGreetingMsg,
  getLocalDeviceId,
  useChatInit,
} from "@/components/chat/chat-utils";
import {
  defaultAImessage,
  defaultDataMessage,
  defaultUserMessage,
  IChatMessage,
} from "@/lib/types/session";
import { IPerson } from "@/lib/types/person";
import { queryClient } from "@/lib/clients/query-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { aid } = useParams() as { aid: string };
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const lastToolRef = useRef<string | null>(null);
  const isWidget = searchParams.get("widget") === "true";
  const fromPage = searchParams.get("fromPage") || undefined;
  const { agent } = useAgent(aid);
  const { sessionId, session, person, isLoading, updatePerson } =
    useChatInit(aid);

  const messagesLoading = isLoading;
  const initialMessages = useMemo(() => {
    if (!agent) return [];
    if (!session)
      return [
        ...(person ? [defaultDataMessage(person)] : []),
        getGreetingMsg(agent),
      ];
    return [
      ...(person ? [defaultDataMessage(person)] : []),
      getGreetingMsg(agent),
      ...session.messages,
    ];
  }, [agent, session, person]);

  const { messages, sendMessage, setMessages, status } = useChat<IChatMessage>({
    id: sessionId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/query-stream",
      body: () => {
        const deviceId = agent ? getLocalDeviceId(agent.wid) : undefined;
        const queryData = queryClient.getQueryData(chatInitKey(aid)) as
          | { person?: IPerson }
          | undefined;
        const personId = queryData?.person?.id;

        return {
          aid,
          deviceId,
          personId,
          sessionId,
          fromPage,
        };
      },
    }),
    onData: (data) => {
      console.log("data: ", data);
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall?.toolCallId) {
        lastToolRef.current = toolCall.toolCallId;
      }
    },

    onError: (error) => {
      console.error(error.message);
      const aimsg = defaultAImessage(error.message);
      setMessages((prev) => [...prev, aimsg]);
    },
    onFinish: (messages) => {
      const lastMessage = messages.messages[
        messages.messages.length - 1
      ] as IChatMessage;

      const lastTool = lastMessage.parts?.find(
        (part) => part.type === "tool-collectInformation"
      ) as ToolUIPart;

      if (lastTool?.toolCallId && lastToolRef.current === lastTool.toolCallId) {
        lastToolRef.current = null;
        const newPerson = (lastTool.output as { person: IPerson })?.person;
        if (newPerson) {
          updatePerson(newPerson);
        }
      }
      messages.message.metadata = { createdAt: new Date().toISOString() };
      const aimsg = messages.message as IChatMessage;
      const prevMessages = messages.messages.slice(0, -1);
      setMessages([...prevMessages, aimsg]);
    },
  });

  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !aid || !agent) return;
    sendMessage({
      text: input,
      metadata: { createdAt: new Date().toISOString() },
    });
    setInput("");
  };

  useEffect(() => {
    if (isWidget) {
      // Notify parent window that widget is ready
      window.parent.postMessage({ type: "MAGICALCX_WIDGET_READY" }, "*");

      // Add widget-specific styling
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.margin = "";
        document.body.style.padding = "";
        document.body.style.overflow = "";
      };
    }
  }, [isWidget]);
  if (!agent)
    return (
      <div className="flex items-center justify-center flex-col h-screen bg-background px-6">
        <div className="section-container border-x border-y py-16 px-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-border flex items-center justify-center">
            <svg
              className="w-10 h-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-3xl leading-normal md:text-4xl mb-4 text-foreground">
            Hey, Agent Not Found
          </h2>

          <p className="text-base leading-relaxed text-muted-foreground max-w-md mx-auto mb-8">
            The agent you&apos;re looking for doesn&apos;t exist or may have
            been removed. Please contact{" "}
            <a
              href="mailto:support@magicalcx.com"
              className="text-foreground font-medium underline underline-offset-4 hover:no-underline"
            >
              MagicalCX Support
            </a>{" "}
            for assistance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="px-8 py-6 text-base rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 hover:shadow-lg active:scale-100 transition-all"
            >
              <Link href="mailto:support@magicalcx.com">Contact Support</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="px-8 py-6 text-base rounded-full border-border hover:bg-accent hover:scale-105 active:scale-100 transition-all"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  return (
    <div
      className={`h-full flex flex-col overflow-hidden bg-white relative ${
        isWidget ? "h-screen" : "max-w-4xl mx-auto"
      }`}
    >
      <ChatHeader agent={agent} isWidget={isWidget} />
      <div className="flex-1 overflow-hidden relative">
        {messagesLoading ? (
          <div></div>
        ) : (
          <MessageList
            agent={agent}
            messages={messages as IChatMessage[]}
            status={status}
            isWidget={isWidget}
          />
        )}
      </div>
      <ChatInput
        agent={agent}
        input={input}
        handleSubmit={handleChatSubmit}
        handleInputChange={(e) => setInput(e.target.value)}
        status={status}
        isWidget={isWidget}
      />
    </div>
  );
}
