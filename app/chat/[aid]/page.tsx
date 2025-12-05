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

export default function ChatPage() {
  const { aid } = useParams() as { aid: string };
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const lastToolRef = useRef<string | null>(null);
  const isWidget = searchParams.get("widget") === "true";
  const { agent } = useAgent(aid);
  const { sessionId, session, person, isLoading, updatePerson } =
    useChatInit(aid);
  const lastUserMessageRef = useRef<string | null>(null);
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
          deviceId: deviceId,
          personId: personId,
          sessionId: sessionId,
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
      lastUserMessageRef.current = null;
    },

    onError: (error) => {
      // Never mind if we remove this the error message will not shown
      setTimeout(() => {
        const usermsg = defaultUserMessage(lastUserMessageRef.current || "");
        const aimsg = defaultAImessage(error.message);
        setMessages((prev) => [...prev, usermsg]);
        setMessages((prev) => [...prev, aimsg]);
      }, 0);
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
    lastUserMessageRef.current = input;
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
  if (!agent) return <div>Agent not found</div>;
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
