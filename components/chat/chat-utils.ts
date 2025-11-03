import queryClient from "@/lib/clients/query-client";
import { sessionKey } from "@/lib/hooks/session/use-session";
import chatService from "@/lib/services/chat-service";
import { IAgent } from "@/lib/types/agent";
import { IChatMessage, ISession } from "@/lib/types/session";
import { useQueryClient } from "@tanstack/react-query";
import { UIMessage } from "ai";
import { v4 } from "uuid";

export const initChat = async (agent: IAgent) => {
  const sid = getLocalSession(agent.id);

  if (!sid) {
    const session = await chatService.createSession(agent.wid, agent.id);
    queryClient.setQueryData(sessionKey(session.id), session);
  }

  const deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    const did = v4();
    localStorage.setItem("deviceId", did);
  }
};

export const refreshSession = async (agent: IAgent) => {
  //remove current session
  removeLocalSession(agent.id);

  window.location.reload();
};

export const getGreetingMsg = (agent: IAgent): IChatMessage => {
  return {
    id: "greeting-message",
    role: "assistant",
    metadata: {
      createdAt: new Date().toISOString(),
    },
    parts: [
      {
        type: "text",
        text: agent.customization.greetingMessage,
      },
    ],
  };
};

export const saveLocalSession = (aid: string, sid: string) => {
  let sessions = localStorage.getItem("sessions");
  let sessionsMap = sessions ? JSON.parse(sessions) : {};
  sessionsMap = {
    ...sessionsMap,
    [aid]: sid,
  };
  localStorage.setItem("sessions", JSON.stringify(sessionsMap));
};

export const removeLocalSession = (aid: string) => {
  let sessions = localStorage.getItem("sessions");
  let sessionsMap = sessions ? JSON.parse(sessions) : {};
  delete sessionsMap[aid];
  localStorage.setItem("sessions", JSON.stringify(sessionsMap));
};

export const getLocalSession = (aid: string) => {
  let sessions = localStorage.getItem("sessions");
  let sessionsMap = sessions ? JSON.parse(sessions) : {};
  return sessionsMap[aid];
};

export const saveLocalTrainSession = (wid: string, sid: string) => {
  let sessions = localStorage.getItem("trainSessions");
  let sessionsMap = sessions ? JSON.parse(sessions) : {};
  sessionsMap = {
    ...sessionsMap,
    [wid]: sid,
  };
  localStorage.setItem("trainSessions", JSON.stringify(sessionsMap));
};

export const removeLocalTrainSession = (wid: string) => {
  let sessions = localStorage.getItem("trainSessions");
  let sessionsMap = sessions ? JSON.parse(sessions) : {};
  delete sessionsMap[wid];
  localStorage.setItem("trainSessions", JSON.stringify(sessionsMap));
};

export const getLocalTrainSession = (wid: string) => {
  let sessions = localStorage.getItem("trainSessions");
  let sessionsMap = sessions ? JSON.parse(sessions) : {};
  return sessionsMap[wid];
};
