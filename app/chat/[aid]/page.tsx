"use client";

import { useChat } from "@ai-sdk/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatRequestOptions, DefaultChatTransport, ToolUIPart } from "ai";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { useAgent } from "@/lib/hooks/agent/use-agent";
import { sessionKey, useSession } from "@/lib/hooks/session/use-session";
import {
  getGreetingMsg,
  getLocalDeviceId,
  useChatInit,
} from "@/components/chat/chat-utils";
import chatService from "@/lib/services/chat-service";
import {
  defaultAImessage,
  defaultDataMessage,
  defaultUserMessage,
  IChatMessage,
  ISession,
} from "@/lib/types/session";
import peopleService from "@/lib/services/people-service";
import { IPerson } from "@/lib/types/person";
import { queryClient } from "@/lib/clients/query-client";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { aid } = useParams() as { aid: string };
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const lastToolRef = useRef<string | null>(null);
  const sessionRef = useRef<ISession | undefined>(undefined);

  const [isInitializing, setIsInitializing] = useState(true);
  // Check if running in widget mode
  const isWidget = searchParams.get("widget") === "true";

  const { agent } = useAgent(aid);

  // const {
  //   session,
  //   person,
  //   deviceId,
  //   isLoading,
  //   error,
  //   refresh,
  //   updatePerson,
  //   updateSession,
  // } = useChatInit(aid);

  const {
    sessionId,
    session,
    person,
    deviceId,
    isLoading,
    updatePerson,
    error,
  } = useChatInit(aid);

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
        console.log("Testing : ", {
          aid,
          deviceId: deviceId,
          personId: sessionRef.current?.personId,
          sessionId: sessionRef.current?.id,
        });

        return {
          aid,
          deviceId: deviceId,
          personId: person?.id,
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
    },

    onError: (error) => {
      console.error("Error: ", error);
      const aimsg = defaultAImessage("Error: " + error.message);
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

      // chatService.saveMessage(aid, sessionId, aimsg);
    },
  });

  const handleChatSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    options: ChatRequestOptions
  ) => {
    e.preventDefault();
    if (!input.trim() || !aid || !agent) return;

    const msg = defaultUserMessage(input);

    sendMessage({
      text: input,
      metadata: { createdAt: new Date().toISOString() },
    });

    // chatService.saveMessage(aid, sessionId, msg);

    setInput("");
  };

  // useEffect(() => {
  //   if (agent) {
  //     initChat(agent).then((did) => setDeviceId(did));
  //   }
  // }, [aid, agent]);

  // useEffect(() => {
  //   if (!session) return;
  //   if (!agent) return;

  //   console.log("checking if session has personId:");

  //   if (session) {
  //     if (session.messages.length > 0) {
  //       setMessages((prev) => [...prev, ...session.messages]);
  //     }

  //     if (session.personId) {
  //       setIsInitializing(true);
  //       console.log("ruuning person check: ");

  //       peopleService
  //         .getPerson(agent.wid, session.personId)
  //         .then((person) => {
  //           console.log("person: ", person);
  //           if (person) {
  //             setMessages((prev) => [defaultDataMessage(person), ...prev]);
  //           }
  //         })
  //         .finally(() => {
  //           setIsInitializing(false);
  //         });
  //     } else {
  //       setIsInitializing(false);
  //     }
  //   }
  // }, [session, agent]);

  // Widget-specific styles
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
