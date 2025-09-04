import queryClient from "@/lib/clients/query-client";
import { sessionKey } from "@/lib/hooks/session/use-session";
import chatService from "@/lib/services/chat-service";
import { IAgent } from "@/lib/types/agent";
import { useQueryClient } from "@tanstack/react-query";
import { UIMessage } from "ai";
import { v4 } from "uuid";

export const initChat = async (agent: IAgent) => {
  let sid = localStorage.getItem("session_id");

  if (!sid) {
    const session = await chatService.createSession(agent.wid, agent.id);
    queryClient.setQueryData(sessionKey(session.id), session);
  }
};

export const refreshSession = async (agent: IAgent) => {
  //remove current session
  localStorage.removeItem("session_id");

  window.location.reload();
};

export const getGreetingMsg = (agent: IAgent): UIMessage => {
  return {
    id: "greeting-message",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: agent.customization.greetingMessage,
      },
    ],
  };
};
