import { tool, UIMessageStreamWriter } from "ai";
import { z } from "zod";
import peopleService from "../services/people-service";
import { IExternalIds, IPerson } from "../types/person";
import chatService from "../services/chat-service";
import { IChannelProvider } from "../types/channel";
import peopleServiceV2 from "../services/people-service-v2";

const PersonInfo = z.object({
  // Core identity (any subset is fine)
  name: z.string().optional(),
  emails: z
    .string()
    .email()
    .describe(
      "Email address, must be valid and will be stored in lowercase and the latest emails only."
    )

    .default(""),
  phones: z

    .string()
    .describe(
      "Phone number. Only digits and leading '+' allowed. If starting with '00', it will be treated as '+'. and the latest phone numbers only."
    )

    .default(""),

  // Company info
  company: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),

  // Interests of users
  interests: z
    .array(z.string())
    .optional()
    .describe(
      "High-signal interests, preferences, or intent markers. " +
        "FOCUS ON: 1. Buying Intent (e.g., 'interested in enterprise plan', 'budget conscious'), " +
        "2. Product/Feature Preferences (e.g., 'needs API access', 'prefers dark mode'), " +
        "3. User Goals (e.g., 'migrating from HubSpot', 'automating customer support'). " +
        "AVOID: Generic terms like 'asking questions', 'curious', or temporary states."
    ),
  // Insights about conversations and issues about the person
  memories: z
    .array(z.string())
    .optional()
    .describe(
      "Insights about conversations and issues about the person, it should be a list of strings described as your telling ur friends or teammates abou tthe person"
    ),
});

export const collectInformation = ({
  wid,
  aid,
  sessionId,
  provider,
  providerId,
  currentPersonId,
  ips,
}: {
  wid: string;
  aid: string;
  sessionId: string;
  provider: IChannelProvider;
  providerId: string;
  currentPersonId?: string;
  ips?: string[];
}) =>
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
        emails: [{ value: params.emails, verified: false }],
        phones: [{ value: params.phones, verified: false }],
        externalIds: externalIds,
        ips: ips ?? [],
        company: params.company,
        title: params.title,
        location: params.location,
        memories: params.memories ?? [],
        interests: params.interests ?? [],
      };

      let personData;

      console.log("current person id: ", currentPersonId);

      if (currentPersonId) {
        console.log("current user id: ", currentPersonId);
        try {
          // ✅ ALREADY IDENTIFIED - Just update their info
          if (params.emails.length > 0 || params.phones.length > 0) {
            console.log("Identifying person with emails: ", params.emails);
            console.log("Identifying person with phones: ", params.phones);
            const emails = [{ value: params.emails, verified: false }];
            const phones = [{ value: params.phones, verified: false }];
            const { existing, person, softmerge } =
              await peopleServiceV2.identifyPerson({
                wid: wid,
                emails: emails,
                phones: phones,
                ips: ips ?? [],
                provider: provider,
              });

            // same person is found
            if (existing && person?.id && currentPersonId === person.id) {
              console.log("Same person found, updating person: ", person.id);
              // same person just update the person
              personData = await peopleServiceV2.updatePerson({
                wid,
                personId: currentPersonId,
                data: data,
              });
            } else if (
              existing &&
              person?.id &&
              currentPersonId !== person.id &&
              softmerge
            ) {
              // different person found, soft merge
              console.log("Different person found, soft merging: ", person.id);
              await peopleServiceV2.softMergePerson({
                wid: wid,
                personAId: currentPersonId,
                personBId: person.id,
              });
              personData = await peopleServiceV2.updatePerson({
                wid,
                personId: currentPersonId,
                data: data,
              });
            } else if (
              existing &&
              person?.id &&
              currentPersonId !== person.id &&
              !softmerge
            ) {
              // different person found, direct merge
              console.log(
                "Different person found, direct merging: ",
                person.id
              );
              personData = await peopleServiceV2.directMergePerson({
                wid: wid,
                personAId: currentPersonId,
                personBId: person.id,
              });
            } else {
              // no person found  just update current person
              console.log(
                "No person found, updating current person: ",
                currentPersonId
              );
              personData = await peopleServiceV2.updatePerson({
                wid,
                personId: currentPersonId,
                data: data,
              });
            }
          } else {
            // no emails or phones  update current person
            console.log(
              "No emails or phones, updating current person: ",
              currentPersonId
            );
            personData = await peopleServiceV2.updatePerson({
              wid,
              personId: currentPersonId,
              data: data,
            });
          }
        } catch (error) {
          console.warn("Person not found, re-identifying", error);
          currentPersonId = undefined;
        }
      }

      // ❓ NOT IDENTIFIED - Need to identify or create
      if (!currentPersonId) {
        //check if person already exists
        const { existing, person, softmerge } =
          await peopleServiceV2.identifyPerson({
            wid: wid,
            ...data,
            provider: provider,
          });
        personData = person;

        console.log("existing: ", existing);

        //if person does not exist, create a new one

        if (!existing) {
          console.log("creating a new person: ", { ...params });
          personData = await peopleServiceV2.createPerson({
            wid: wid,
            sessionId: sessionId,
            emails: [{ value: params.emails, verified: false }],
            phones: [{ value: params.phones, verified: false }],
            externalIds: externalIds,
            name: params.name,
            aid,
            ip: ips?.[0],
          });

          //attach person id to session
          await chatService.updateSession(aid, sessionId, {
            personId: personData.id,
          });
        }
        //if person exists and is a soft merge, soft merge the person
        else if (softmerge && existing) {
          const newPersonData = await peopleServiceV2.createPerson({
            wid: wid,
            sessionId: sessionId,
            emails: [{ value: params.emails, verified: false }],
            phones: [{ value: params.phones, verified: false }],
            externalIds: externalIds,
            name: params.name,
            aid,
            ip: ips?.[0],
          });
          await peopleServiceV2.softMergePerson({
            wid: wid,
            personAId: newPersonData.id,
            personBId: personData!.id,
          });
          personData = newPersonData;
          await chatService.updateSession(aid, sessionId, {
            personId: personData.id,
          });
        }

        //if person exists, update the person
        else {
          console.log("updating the person: ", { ...params });
          await peopleServiceV2.updatePerson({
            wid,
            personId: personData!.id,
            data: data,
          });
        }

        // Update session with newly identified person
        await chatService.updateSession(aid, sessionId, {
          personId: personData!.id,
        });
        //update pastSessionIds in  person data
        await peopleService.updatePastSessionIds({
          wid,
          personId: personData!.id,
          sessionId,
          aid,
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
