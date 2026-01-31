"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DefaultChatTransport, ToolUIPart, UIMessage } from "ai";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { StarterMessages } from "@/components/chat/starter-messages";
import { MessageLoading } from "@/components/chat/message-loading";
import { ChatLoader } from "@/components/chat/chat-loader";
import { AgentNotFound } from "@/components/chat/agent-not-found";
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
  IChatMessage,
} from "@/lib/types/session";
import { IPerson } from "@/lib/types/person";
import { queryClient } from "@/lib/clients/query-client";
import { IAgent } from "@/lib/types/agent";
import { getMessageStyle } from "@/lib/utils/message-utils";

export default function ChatPageClient({
  aid,
  initialAgent,
  widget,
  fromPageValue,
}: {
  aid: string;
  initialAgent?: IAgent;
  widget?: string;
  fromPageValue?: string;
}) {
  const [input, setInput] = useState("");
  const lastToolRef = useRef<string | null>(null);
  const pendingStarterRef = useRef<string | null>(null);
  const isWidget = widget === "true";
  const fromPage = fromPageValue || undefined;
  const {
    agent,
    isLoading: agentLoading,
    isFetching: agentFetching,
  } = useAgent(aid, initialAgent);

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
        return { aid, deviceId, personId, sessionId, fromPage };
      },
    }),
    onToolCall: ({ toolCall }) => {
      if (toolCall?.toolCallId) lastToolRef.current = toolCall.toolCallId;
    },
    onError: (error) => {
      console.error(error.message);
      setMessages((prev) => [...prev, defaultAImessage(error.message)]);
    },
    onFinish: (messages) => {
      const lastMessage = messages.messages[
        messages.messages.length - 1
      ] as IChatMessage;
      const lastTool = lastMessage.parts?.find(
        (part) => part.type === "tool-collectInformation",
      ) as ToolUIPart;
      if (lastTool?.toolCallId && lastToolRef.current === lastTool.toolCallId) {
        lastToolRef.current = null;
        const newPerson = (lastTool.output as { person: IPerson })?.person;
        if (newPerson) updatePerson(newPerson);
      }
      messages.message.metadata = { createdAt: new Date().toISOString() };
      setMessages([
        ...messages.messages.slice(0, -1),
        messages.message as IChatMessage,
      ]);
    },
  });

  const latestRef = useRef({ status, messagesLoading, sessionId, sendMessage });
  latestRef.current = { status, messagesLoading, sessionId, sendMessage };
  const canSendStarter =
    isWidget && status === "ready" && !messagesLoading && !!sessionId;

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
    if (!isWidget) return;
    const handleWidgetMessage = (event: MessageEvent) => {
      if (event.data?.type !== "MAGICALCX_WIDGET_STARTER") return;
      const text =
        typeof event.data?.text === "string" ? event.data.text.trim() : "";
      if (!text) return;
      const { status, messagesLoading, sessionId, sendMessage } =
        latestRef.current;
      if (status !== "ready" || messagesLoading || !sessionId) {
        pendingStarterRef.current = text;
        return;
      }
      sendMessage({ text, metadata: { createdAt: new Date().toISOString() } });
    };
    window.addEventListener("message", handleWidgetMessage);
    window.parent.postMessage({ type: "MAGICALCX_WIDGET_READY" }, "*");
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    document.documentElement.style.height = "100dvh";
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("message", handleWidgetMessage);
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
    };
  }, [isWidget]);

  useEffect(() => {
    if (!canSendStarter || !pendingStarterRef.current) return;
    const text = pendingStarterRef.current;
    pendingStarterRef.current = null;
    sendMessage({ text, metadata: { createdAt: new Date().toISOString() } });
  }, [canSendStarter, sendMessage]);

  if (!agent && (agentLoading || agentFetching)) return <ChatLoader />;

  if (!agent) return <AgentNotFound />;

  return (
    <div
      className={`h-full flex flex-col overflow-hidden bg-white relative ${
        isWidget ? "h-dvh max-h-dvh" : "max-w-4xl mx-auto"
      }`}
    >
      <ChatHeader agent={agent} isWidget={isWidget} />
      <div className="flex-1 overflow-hidden relative">
        {messagesLoading ? (
          <MessagesLoading />
        ) : (
          <>
            <MessageList
              agent={agent}
              messages={messages as IChatMessage[]}
              status={status}
              isWidget={isWidget}
            />
            {!messages.some((m) => m.role === "user") && (
              <StarterMessages
                agent={agent}
                onSelectMessage={(message) => {
                  sendMessage({
                    text: message,
                    metadata: { createdAt: new Date().toISOString() },
                  });
                }}
                disabled={status !== "ready"}
              />
            )}
          </>
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

const MessagesLoading = () => (
  <div className="h-full overflow-y-auto p-4">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-start">
        <div
          className={`max-w-[90%] md:max-w-[75%] leading-7 ${getMessageStyle(
            {
              id: "loading",
              role: "assistant",
              parts: [{ type: "text", text: "" }],
            } as UIMessage,
            "assistant",
          )}`}
        >
          <MessageLoading />
        </div>
      </div>
    </div>
  </div>
);
