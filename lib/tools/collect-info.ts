import { tool, UIMessageStreamWriter } from "ai";
import { z } from "zod";
import peopleService from "../services/people-service";
import { IExternalIds, IPerson } from "../types/person";
import chatService from "../services/chat-service";
import { IChannelProvider } from "../types/channel";

const PersonInfo = z.object({
  // Core identity (any subset is fine)
  name: z.string().optional(),
  emails: z
    .array(
      z
        .string()
        .email()
        .describe(
          "Email address, must be valid and will be stored in lowercase"
        )
    )
    .default([]),
  phones: z
    .array(
      z
        .string()
        .describe(
          "Phone number. Only digits and leading '+' allowed. If starting with '00', it will be treated as '+'."
        )
    )
    .default([]),

  // Company info
  company: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),

  // Interests of users
  interests: z.array(z.string()).optional(),

  // Insights about conversations and issues about the person
  memories: z
    .array(z.string())
    .optional()
    .describe(
      "Insights about conversations and issues about the person, it should be a list of strings described as your telling ur friends or teammates abou tthe person"
    ),
});

export const collectInformation = (
  wid: string,
  aid: string,
  sessionId: string,
  provider: IChannelProvider,
  providerId: string
) =>
  tool({
    name: "Collect Information",
    description:
      "Always include the user's name and email when calling this tool, asking for them politely if missing. " +
      "Upsert a single person object (identity + interests + preferences + tags/notes) into Firestore. Use whenever the user shares durable info worth remembering.",
    inputSchema: PersonInfo,
    execute: async (params) => {
      console.log("params: ", params);
      console.log("provider: ", provider);
      console.log("providerId: ", providerId);
      console.log("sessionId: ", sessionId);

      const externalIds: IExternalIds = [
        {
          provider: provider,
          id: providerId,
        },
      ];

      const data: Partial<IPerson> = {
        name: params.name,
        emails: params.emails,
        phones: params.phones,
        externalIds: externalIds,
      };
      let personData;

      //check if person already exists
      const { existing, person } = await peopleService.identify({
        wid: wid,
        ...data,
      });
      personData = person;

      //if person does not exist, create a new one
      if (!existing) {
        personData = await peopleService.create2({
          wid: wid,
          sessionId: sessionId,
          emails: params.emails,
          phones: params.phones,
          externalIds: externalIds,
          name: params.name,
        });

        //attach person id to session
        await chatService.updateSession(aid, sessionId, {
          personId: personData.id,
        });
      }

      //if person exists, update the person
      else {
        console.log("updating the person: ", { ...params });

        await peopleService.update({
          wid: wid,
          personId: personData!.id,
          updates: {
            ...params,
          },
        });
      }

      return {
        person: personData,
      };
    },

    // execute: async (params) => {
    //   console.log("collecting information: ", params);

    //   let personId = params.personId;
    //   if (!personId) {
    //     const result = await peopleService.identifyPerson({
    //       wid: wid,
    //       email: params.email,
    //       phone: params.phone,
    //       name: params.name,
    //       externalIds: params.externalIds,
    //     });

    //     console.log("personId: ", result.personId);
    //     console.log("existing: ", result.existing);
    //     console.log("data: ", params);
    //     personId = result.personId;
    //   }

    //   const update = await peopleService.updatePerson(
    //     wid,
    //     personId,
    //     params as Partial<IPerson>
    //   );

    //   console.log(
    //     `user information that you should use for personalization but never share it with user directly: ${JSON.stringify(
    //       update
    //     )}`
    //   );

    //   return `User information that you should use for personalization but never share it with user directly: ${JSON.stringify(
    //     update
    //   )}`;
    // },
  });
