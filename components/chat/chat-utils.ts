import queryClient from "@/lib/clients/query-client";
import { useAgent } from "@/lib/hooks/agent/use-agent";
import { sessionKey } from "@/lib/hooks/session/use-session";
import chatService from "@/lib/services/chat-service";
import peopleService from "@/lib/services/people-service";
import { IAgent } from "@/lib/types/agent";
import { IPerson } from "@/lib/types/person";
import { IChatMessage, ISession } from "@/lib/types/session";
import lsMap from "@/lib/utils/ls-map";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ModelMessage } from "ai";
import { arrayUnion } from "firebase/firestore";
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
    externalIds: [{ id: deviceId, provider: "web" }],
  });

  const sid = getLocalSession(agent.id);

  //create new session
  if (!sid) {
    createNewSession(agent.wid, agent.id, person);
  } else {
    //get session by open status
    const sessions = await chatService.getSessionsByFilter({
      aid: agent.id,
      sid: sid,
      status: "open",
      nLimit: 1,
    });

    let session = sessions.length > 0 ? sessions[0] : null;

    //if no session, create new session
    if (!session) {
      session = await createNewSession(agent.wid, agent.id, person);
    }

    //if person exists, and session personId is different, update session
    if (person && person.id && session?.personId !== person.id) {
      console.log("updating session: ", session?.id, person.id);

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

const initChat2 = async (agent: IAgent) => {
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

  const personPromise = peopleService.identify({
    wid: agent.wid,
    externalIds: [{ id: deviceId, provider: "web" }],
  });

  //parallelized for better performance
  const [sessions, { person }] = await Promise.all([
    sessionsPromise,
    personPromise,
  ]);

  // Try to get open session
  let session = sessions[0];

  // Create new session if needed
  if (!session) {
    session = await createNewSession(agent.wid, agent.id, person);
  }

  // Update session with personId if necessary
  if (person?.id && session.personId !== person.id) {
    await chatService.updateSession(agent.id, session.id, {
      personId: person.id,
    });

    session = { ...session, personId: person.id };
  }

  //check if session id exists in person pastSessionIds
  if (person?.id && !person.pastSessionIds.includes(session.id)) {
    const pastSessionIds = Array.from(
      new Set([...(person.pastSessionIds ?? []), session.id])
    );
    peopleService.update({
      wid: agent.wid,
      personId: person.id,
      updates: {
        pastSessionIds: pastSessionIds,
      },
    });
  }
  return { session, person, deviceId };
};

export const chatInitKey = (aid: string) => ["chat-init", aid];

export const useChatInit = (aid: string) => {
  const { agent } = useAgent(aid);
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: chatInitKey(aid),
    queryFn: () => initChat2(agent!),
    enabled: !!agent,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
  const refresh = () => {
    removeLocalSession(aid);
    refetch();
  };

  console.log("data.person: ", data?.person);

  const updatePerson = (newPerson: IPerson) => {
    qc.setQueryData(chatInitKey(aid), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        person: newPerson,
        session: { ...old.session, personId: newPerson.id },
      };
    });
  };

  return {
    agent,
    session: data?.session,
    person: data?.person,
    deviceId: data?.deviceId,
    isLoading: isLoading,
    error: error,
    refresh,
    updatePerson,
  };
};

const getOrCreateDeviceId = (wid: string) => {
  let id = getLocalDeviceId(wid);
  if (!id) saveLocalDeviceId(wid, (id = v4()));
  return id;
};

const createNewSession = async (wid: string, aid: string, person?: IPerson) => {
  //create new session
  const session = await chatService.createSession(wid, aid, person?.id);

  // Only update if the session id is not already present
  // if (person && !person.pastSessionIds.includes(session.id)) {
  //   const updatedSessionIds = [...(person.pastSessionIds ?? []), session.id];
  //   peopleService.update({
  //     wid,
  //     personId: person.id,
  //     updates: {
  //       pastSessionIds: updatedSessionIds,
  //     },
  //   });
  // }

  queryClient.setQueryData(sessionKey(session.id), session);
  return session;
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
