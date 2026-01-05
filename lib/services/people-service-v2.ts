import {
  arrayUnion,
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { generateDefaultPerson, IExternalIds, IPerson } from "../types/person";
import { db } from "../clients/firebase";
import { normEmail, normIp, normNote, normPhone, normWord } from "../utils";
import { IChannelProvider } from "../types/channel";
import { apiClient } from "../clients/axios-client";

class PeopleServiceV2 {
  // identify person by email, phone, externalIds, ips, provider
  async identifyPerson({
    wid,
    emails,
    phones,
    externalIds,
    name,
    ips,
    provider,
  }: {
    wid: string;
    emails?: { value: string; verified: boolean }[];
    phones?: { value: string; verified: boolean }[];
    externalIds?: IExternalIds;
    name?: string;
    ips?: string[];
    provider: IChannelProvider;
  }) {
    try {
      const peopleCol = collection(db, `workspaces/${wid}/people`);
      const emailNs = emails
        ?.map((e) => {
          return { value: normEmail(e.value), verified: e.verified };
        })
        .filter((e) => e.value);
      const phoneNs = phones
        ?.map((p) => {
          return { value: normPhone(p.value), verified: p.verified };
        })
        .filter((p) => p.value);
      const ipNs = ips?.map(normIp).filter(Boolean);

      let personSnap: DocumentSnapshot | undefined = undefined;

      //   Identify by deviceIds (ExternalIds)
      if (externalIds && externalIds.length > 0) {
        console.log("Identifying person by externalIds: ", externalIds);
        for (const externalId of externalIds) {
          const q = query(
            peopleCol,
            where("externalIds", "array-contains", {
              provider: externalId.provider,
              id: externalId.id,
            }),
            limit(1)
          );
          const snaps = await getDocs(q);
          if (snaps.docs.length > 0) {
            personSnap = snaps.docs[0];
            if (ips && ips.length > 0) {
              peopleServiceV2.updatePerson({
                wid,
                personId: personSnap.id,
                data: {
                  ips: ipNs,
                },
              });
            }
            console.log("Person found by web deviceId:", personSnap.data());
          }
          break;
        }
      }

      if (!personSnap && provider === "web" && ipNs && ipNs.length > 0) {
        // Query persons by IPs first
        const q = query(
          peopleCol,
          where("ips", "array-contains-any", ipNs),
          limit(10)
        );
        const snaps = await getDocs(q);
        // Identify by phones - check each phone in order if it exists in the docs
        if (phoneNs && phoneNs.length > 0) {
          const matchingDoc = snaps.docs.find((doc) => {
            const person = doc.data() as IPerson;
            const personPhones =
              person.phones
                ?.map((p) => p.value)
                .filter((v): v is string => Boolean(v)) || [];
            // Check each phone in order to see if it exists in the document
            return phoneNs.some((phoneInput) => {
              const phoneValue = phoneInput.value;
              return phoneValue && personPhones.includes(phoneValue);
            });
          });
          if (matchingDoc) {
            personSnap = matchingDoc;
            console.log("Person found by ip and phone:", personSnap.data());
          }
        }
        // Identify by emails - check each email in order if it exists in the docs
        if (!personSnap && emailNs && emailNs.length > 0) {
          const matchingDoc = snaps.docs.find((doc) => {
            const person = doc.data() as IPerson;
            const personEmails =
              person.emails
                ?.map((e) => e.value)
                .filter((v): v is string => Boolean(v)) || [];
            // Check each email in order to see if it exists in the document
            return emailNs.some((emailInput) => {
              const emailValue = emailInput.value;
              return emailValue && personEmails.includes(emailValue);
            });
          });
          if (matchingDoc) {
            personSnap = matchingDoc;
            console.log("Person found by ip and email:", personSnap.data());
          }
        }
      }

      if (personSnap) {
        const person = personSnap.data() as IPerson;
        return { existing: true, person: person, softmerge: false };
      }

      // Identify by email
      if (emailNs && emailNs.length > 0) {
        console.log("Attempting to identify by email:", emailNs);
        const q = query(
          peopleCol,
          where("emails", "array-contains-any", emailNs),
          limit(1)
        );
        const snaps = await getDocs(q);
        console.log("Email lookup result count:", snaps.docs.length);
        if (snaps.docs.length > 0) {
          personSnap = snaps.docs[0];
          console.log("Person found by email:", personSnap.data());
        }
      }

      // Identify by phone
      if (!personSnap && phones && phoneNs && phoneNs.length > 0) {
        console.log("Attempting to identify by phone:", phoneNs);
        const q = query(
          peopleCol,
          where("phones", "array-contains-any", phoneNs),
          limit(1)
        );
        const snaps = await getDocs(q);
        console.log("Phone lookup result count:", snaps.docs.length);
        if (snaps.docs.length > 0) {
          personSnap = snaps.docs[0];
          console.log("Person found by phone:", personSnap.data());
        }
      }
      if (personSnap) {
        const person = personSnap.data() as IPerson;
        return { existing: true, person: person, softmerge: true };
      }
      console.log("No existing person found.");
      return { existing: false, person: undefined, softmerge: false };
    } catch (error) {
      console.error("Error identifying person : ", error);
      return { existing: false, person: undefined, softmerge: false };
    }
  }

  // get persons by ids
  async getPersons(wid: string, personIds: string[]) {
    if (!personIds || personIds.length === 0) return [];
    const q = query(
      collection(db, `workspaces/${wid}/people`),
      where("id", "in", personIds)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((doc) => doc.data() as IPerson);
  }

  // get person by id
  async getPerson(wid: string, personId: string) {
    console.log("Getting person: ", personId);
    const personRef = doc(db, `workspaces/${wid}/people/${personId}`);
    const snap = await getDoc(personRef);
    return snap.data() as IPerson;
  }

  // update person
  async updatePerson({
    wid,
    personId,
    data,
  }: {
    wid: string;
    personId: string;
    data: Partial<IPerson>;
  }) {
    const personRef = doc(db, `workspaces/${wid}/people/${personId}`);

    const update: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (data.name !== undefined) update.name = data.name;
    if (data.company !== undefined) update.company = data.company;
    if (data.title !== undefined) update.title = data.title;
    if (data.location !== undefined) update.location = data.location;
    if (data.summary !== undefined) update.summary = data.summary;

    // externalIds (shallow merge)
    if (data.externalIds?.length) {
      const externalIds = data.externalIds.map((e) => ({
        provider: e.provider,
        id: e.id,
      }));
      if (externalIds.length) update.externalIds = arrayUnion(...externalIds);
    }
    if (data.emails?.length) {
      const emails = data.emails
        .map((e) => {
          return { value: normEmail(e.value), verified: e.verified };
        })
        .filter((e) => e.value);
      if (emails.length) update.emails = arrayUnion(...emails);
    }

    if (data.phones?.length) {
      const phones = data.phones
        .map((p) => {
          return { value: normPhone(p.value), verified: p.verified };
        })
        .filter((p) => p.value);
      if (phones.length) update.phones = arrayUnion(...phones);
    }
    if (data.ips?.length) {
      const ips = data.ips.map(normIp).filter(Boolean);
      if (ips.length) update.ips = arrayUnion(...ips);
    }
    if (data.tags?.length) {
      const tags = data.tags.map(normWord).filter(Boolean);
      if (tags.length) update.tags = arrayUnion(...tags);
    }

    if (data.interests?.length) {
      const interests = data.interests.map(normWord).filter(Boolean);
      if (interests.length) update.interests = arrayUnion(...interests);
    }

    if (data.notes?.length) {
      const notes = data.notes.map(normNote).filter(Boolean);
      if (notes.length) update.notes = arrayUnion(...notes);
    }

    if (data.memories?.length) {
      const memories = data.memories.map(normNote).filter(Boolean);
      if (memories.length) update.memories = arrayUnion(...memories);
    }

    await updateDoc(personRef, update);
    const person = await this.getPerson(wid, personId);
    return person;
  }

  // create person
  async createPerson({
    wid,
    name,
    emails,
    phones,
    externalIds,
    sessionId,
    aid,
    ip,
  }: {
    wid: string;
    name?: string;
    emails: string[];
    phones: string[];
    externalIds?: IExternalIds;
    sessionId?: string;
    aid?: string;
    ip?: string;
  }) {
    const person = generateDefaultPerson({
      name,
      email: emails[0],
      phone: phones[0],
      externalIds,
      sessionId,
      aid,
      ip,
    });
    const personRef = doc(db, `workspaces/${wid}/people/${person.id}`);
    await setDoc(personRef, person);

    return person;
  }

  // update pastSessionIds
  async updatePastSessionIds({
    wid,
    personId,
    sessionId,
    aid,
  }: {
    wid: string;
    personId: string;
    sessionId: string;
    aid: string;
  }) {
    const personRef = doc(db, `workspaces/${wid}/people/${personId}`);
    await updateDoc(personRef, {
      pastSessionIds: arrayUnion({ aid, sid: sessionId }),
      updatedAt: new Date().toISOString(),
    });
  }

  // soft merge two persons
  async softMergePerson({
    wid,
    personAId,
    personBId,
  }: {
    wid: string;
    personAId: string;
    personBId: string;
  }) {
    const personARef = doc(db, `workspaces/${wid}/people/${personAId}`);
    const personBRef = doc(db, `workspaces/${wid}/people/${personBId}`);
    await updateDoc(personARef, {
      identicalPersonIds: arrayUnion(personBId),
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(personBRef, {
      identicalPersonIds: arrayUnion(personAId),
      updatedAt: new Date().toISOString(),
    });
  }

  // get identical persons
  async getIdenticalPersons(wid: string, personId: string) {
    try {
      const person = await this.getPerson(wid, personId);
      if (
        !person ||
        !person.identicalPersonIds ||
        person.identicalPersonIds.length === 0
      ) {
        return [];
      }
      return await this.getPersons(wid, person.identicalPersonIds);
    } catch (error) {
      console.error("Error getting identical persons: ", error);
      return [];
    }
  }

  async directMergePerson({
    wid,
    personAId,
    personBId,
  }: {
    wid: string;
    personAId: string;
    personBId: string;
  }) {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: IPerson;
      }>("/api/merge", {
        wid,
        personIds: [personAId, personBId],
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to merge persons");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error merging persons:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to merge persons"
      );
    }
  }

  async getAllIdenticalPersons(wid: string) {
    try {
      const peopleCol = collection(db, `workspaces/${wid}/people`);
      const snaps = await getDocs(peopleCol);

      if (snaps.empty) return [];

      const persons: IPerson[] = [];
      for (const doc of snaps.docs) {
        const person = doc.data() as IPerson;
        if (person.identicalPersonIds?.length > 0) {
          persons.push(person);
        }
      }
      return persons;
    } catch (error) {
      console.error("Error getting all identical persons: ", error);
      return [];
    }
  }
}
const peopleServiceV2 = new PeopleServiceV2();
export default peopleServiceV2;
