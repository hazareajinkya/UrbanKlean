import queryClient from "@/lib/clients/query-client";
import { sessionKey } from "@/lib/hooks/session/use-session";
import chatService from "@/lib/services/chat-service";
import peopleService from "@/lib/services/people-service";
import { IAgent } from "@/lib/types/agent";
import { IChatMessage, ISession } from "@/lib/types/session";
import lsMap from "@/lib/utils/ls-map";
import { ModelMessage } from "ai";
import { v4 } from "uuid";

export const initChat = async (agent: IAgent) => {
  let deviceId = getLocalDeviceId(agent.wid);
  if (!deviceId) {
    const did = v4();
    saveLocalDeviceId(agent.wid, did);
    deviceId = did;
  }

  const { person } = await peopleService.identify({
    wid: agent.wid,
    externalIds: { web: deviceId },
  });

  const sid = getLocalSession(agent.id);
  //create new session
  if (!sid) {
    const session = await chatService.createSession(
      agent.wid,
      agent.id,
      person?.id
    );
    queryClient.setQueryData(sessionKey(session.id), session);
  } else if (sid && person && person.id) {
    const session = await chatService.getSession(sid, agent.id);

    if (session?.personId !== person.id) {
      console.log("updating session: ", session?.personId, person.id);
      await chatService.updateSession(agent.id, sid, {
        personId: person.id,
      });

      queryClient.setQueryData(sessionKey(sid), {
        ...session,
        personId: person.id,
      });
    }
  }

  return deviceId;
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
