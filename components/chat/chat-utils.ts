import { useAgent } from "@/lib/hooks/agent/use-agent";
import chatService from "@/lib/services/chat-service";
import peopleService from "@/lib/services/people-service";
import peopleServiceV2 from "@/lib/services/people-service-v2";
import { IAgent } from "@/lib/types/agent";
import { IPerson } from "@/lib/types/person";
import { IChatMessage, ISession } from "@/lib/types/session";
import lsMap from "@/lib/utils/ls-map";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ModelMessage } from "ai";
import { v4 } from "uuid";

export const chatInitKey = (aid: string) => ["chat-init", aid];

export const initChat = async (agent: IAgent) => {
  const deviceId = getOrCreateDeviceId(agent.wid);
  const sid = getLocalSession(agent.id);

  const sessionsPromise = sid
    ? chatService.getSessionsByFilter({
        sid,
        aid: agent.id,
        status: "open",
        nLimit: 1,
      })
    : Promise.resolve([]);

  const personPromise = peopleServiceV2.identifyPersonOnWeb({
    wid: agent.wid,
    deviceIds: [deviceId],
  });

  const [sessions, { person }] = await Promise.all([
    sessionsPromise,
    personPromise,
  ]);

  let session: ISession | undefined;
  let sessionId: string;

  if (sessions.length > 0) {
    session = sessions[0];
    sessionId = session.id;
  } else {
    sessionId = v4();
    saveLocalSession(agent.id, sessionId);
  }

  return { sessionId, session, person, deviceId };
};

export const useChatInit = (aid: string) => {
  const { agent } = useAgent(aid);
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: chatInitKey(aid),
    queryFn: () => initChat(agent!),
    enabled: !!agent,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  const updatePerson = (newPerson: IPerson) => {
    qc.setQueryData(chatInitKey(aid), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        person: newPerson,
      };
    });

    // Update session in backend if sessionId exists
    // Backend handles all pastSessionIds updates automatically
    if (data?.sessionId) {
      chatService.updateSession(aid, data.sessionId, {
        personId: newPerson.id,
      });
    }
  };

  return {
    session: data?.session,
    person: data?.person,
    deviceId: data?.deviceId,
    sessionId: data?.sessionId || "",
    isLoading,
    updatePerson,
    error,
  };
};

const getOrCreateDeviceId = (wid: string) => {
  let id = getLocalDeviceId(wid);
  if (!id) saveLocalDeviceId(wid, (id = v4()));
  return id;
};

export const refreshSession = async (aid: string) => {
  //remove current session
  removeLocalSession(aid);

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

export const saveLocalSession = (aid: string, sid: string) =>
  lsMap.set("sessions", aid, sid);
export const removeLocalSession = (aid: string) =>
  lsMap.remove("sessions", aid);
export const getLocalSession = (aid: string) =>
  lsMap.get<string>("sessions", aid);

export const saveTeachLocalSession = (wid: string, sid: string) =>
  lsMap.set("teach_sessions", wid, sid);
export const removeTeachLocalSession = (wid: string) =>
  lsMap.remove("teach_sessions", wid);
export const getTeachLocalSession = (wid: string) =>
  lsMap.get<string>("teach_sessions", wid);

export const saveLocalDeviceId = (wid: string, deviceId: string) =>
  lsMap.set("device_ids", wid, deviceId);
export const removeLocalDeviceId = (wid: string) =>
  lsMap.remove("device_ids", wid);
export const getLocalDeviceId = (wid: string) =>
  lsMap.get<string>("device_ids", wid);

export const convertToMyModelMessages = (
  messages: IChatMessage[]
): ModelMessage[] => {
  const result: ModelMessage[] = [];

  for (const message of messages) {
    if (message.role === "user") {
      const textParts =
        message.parts
          ?.filter((part) => part.type === "text")
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("") || "";

      if (textParts) {
        result.push({
          role: "user",
          content: [{ type: "text", text: textParts }],
        });
      }
    } else if (message.role === "system") {
      const textParts =
        message.parts
          ?.filter((part) => part.type === "text")
          .map((part) => (part.type === "text" ? part.text : ""))
          .filter((text) => text)
          .join("\n") || "";

      const dataParts =
        message.parts
          ?.filter((part) => part.type === "data-data")
          .map((part) => {
            if (part.type === "data-data") {
              return JSON.stringify({ type: "data", data: part.data });
            }
            return "";
          })
          .filter((data) => data)
          .join("\n") || "";

      const systemContent = [textParts, dataParts]
        .filter((part) => part)
        .join("\n");

      if (systemContent) {
        result.push({
          role: "system",
          content: systemContent,
        });
      }
    } else if (message.role === "assistant") {
      const content: Array<
        | { type: "text"; text: string }
        | {
            type: "tool-call";
            toolCallId: string;
            toolName: string;
            input: unknown;
            providerOptions?: any;
          }
      > = [];
      const toolResults: ModelMessage[] = [];

      for (const part of message.parts || []) {
        if (part.type === "text") {
          content.push({ type: "text", text: part.text });
        } else if (part.type === "dynamic-tool") {
          content.push({
            type: "tool-call",
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            input: part.input,
            providerOptions: (part as any).providerOptions,
          });

          if (part.output !== undefined && part.output !== null) {
            toolResults.push({
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolCallId: part.toolCallId,
                  toolName: part.toolName,
                  output: part.output as any,
                },
              ],
            });
          }
        }
      }

      if (content.length > 0) {
        result.push({ role: "assistant", content });
      }
      result.push(...toolResults);
    }
  }

  return result;
};
