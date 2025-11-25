import {
  arrayUnion,
  collection,
  doc,
  DocumentSnapshot,
  FieldValue,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { normEmail, normNote, normPhone, normWord } from "../utils";
import { kMaxLength } from "buffer";
import { v4 } from "uuid";
import { generateDefaultPerson, IExternalIds, IPerson } from "../types/person";

class PeopleService {
  async identifyPerson({
    email,
    phone,
    wid,
    name,
    externalIds,
  }: {
    wid: string;
    name?: string;
    email?: string;
    phone?: string;
    externalIds?: Record<string, string>;
  }) {
    const peopleCol = collection(db, `workspaces/${wid}/people`);
    const emailN = normEmail(email);
    const phoneN = normPhone(phone);

    let personSnap: DocumentSnapshot | undefined = undefined;

    // 1. try by email
    if (emailN) {
      const q = query(
        peopleCol,
        where("emails", "array-contains", emailN),
        limit(1)
      );

      const snaps = await getDocs(q);
      if (snaps.docs.length > 0) personSnap = snaps.docs[0];
    }

    // 2. try by phone
    if (!personSnap && phoneN) {
      const q = query(
        peopleCol,
        where("phones", "array-contains", phoneN),
        limit(1)
      );

      const snaps = await getDocs(q);
      if (snaps.docs.length > 0) personSnap = snaps.docs[0];
    }

    // 3. try by externalIds
    if (!personSnap && externalIds) {
      for (const [k, v] of Object.entries(externalIds)) {
        const q = query(
          peopleCol,
          where(`externalIds.${k}`, "==", v),
          limit(1)
        );
        const snaps = await getDocs(q);
        if (snaps.docs.length > 0) {
          personSnap = snaps.docs[0];
          break;
        }
      }
    }

    if (personSnap) {
      return { personId: personSnap.id, existing: true };
    }

    // 4. if none found, create new
    const personId = v4();
    const personRef = doc(peopleCol, personId);

    const update: Record<string, any> = {
      id: personId,
      ...(name ? { name } : {}),
      ...(emailN ? { emails: arrayUnion(emailN) } : {}),
      ...(phoneN ? { phones: arrayUnion(phoneN) } : {}),
      ...(externalIds
        ? Object.fromEntries(
            Object.entries(externalIds).map(([k, v]) => [`externalIds.${k}`, v])
          )
        : {}),
      updatedAt: new Date().toISOString(),
      ...(personSnap ? {} : { createdAt: new Date().toISOString() }),
    };

    //create person
    await setDoc(personRef, update, { merge: true });
    return { personId, existing: !!personSnap };
  }

  async updatePerson(wid: string, personId: string, data: Partial<IPerson>) {
    const personRef = doc(db, `workspaces/${wid}/people/${personId}`);

    const update: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (data.name !== undefined) update.name = data.name;
    if (data.company !== undefined) update.company = data.company;
    if (data.title !== undefined) update.title = data.title;
    if (data.location !== undefined) update.location = data.location;

    // externalIds (shallow merge)
    if (data.externalIds) {
      for (const [k, v] of Object.entries(data.externalIds)) {
        update[`externalIds.${k}`] = v;
      }
    }
    if (data.emails?.length) {
      const emails = data.emails.map(normEmail).filter(Boolean);
      if (emails.length) update.emails = arrayUnion(...emails);
    }

    if (data.phones?.length) {
      const phones = data.phones.map(normPhone).filter(Boolean);
      if (phones.length) update.phones = arrayUnion(...phones);
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

  async getPerson(wid: string, personId: string) {
    console.log("Getting person: ", personId);
    const personRef = doc(db, `workspaces/${wid}/people/${personId}`);
    const snap = await getDoc(personRef);
    return snap.data() as IPerson;
  }

  async getPersons(wid: string, personIds: string[]) {
    const q = query(
      collection(db, `workspaces/${wid}/people`),
      where("id", "in", personIds)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((doc) => doc.data() as IPerson);
  }

  async identify({
    wid,
    email,
    phone,
    externalIds,
    name,
  }: {
    wid: string;
    email?: string;
    phone?: string;
    externalIds?: IExternalIds;
    name?: string;
  }) {
    console.log("identify called with:", {
      wid,
      email,
      phone,
      externalIds,
      name,
    });

    const peopleCol = collection(db, `workspaces/${wid}/people`);
    const emailN = normEmail(email);
    const phoneN = normPhone(phone);

    let personSnap: DocumentSnapshot | undefined = undefined;

    // 1. try by email
    if (emailN) {
      console.log("Attempting to identify by email:", emailN);
      const q = query(
        peopleCol,
        where("emails", "array-contains", emailN),
        limit(1)
      );
      const snaps = await getDocs(q);
      console.log("Email lookup result count:", snaps.docs.length);
      if (snaps.docs.length > 0) {
        personSnap = snaps.docs[0];
        console.log("Person found by email:", personSnap.data());
      }
    }

    // 2. try by phone
    if (!personSnap && phoneN) {
      console.log("Attempting to identify by phone:", phoneN);
      const q = query(
        peopleCol,
        where("phones", "array-contains", phoneN),
        limit(1)
      );
      const snaps = await getDocs(q);
      console.log("Phone lookup result count:", snaps.docs.length);
      if (snaps.docs.length > 0) {
        personSnap = snaps.docs[0];
        console.log("Person found by phone:", personSnap.data());
      }
    }

    // 3. try by externalIds
    if (!personSnap && externalIds) {
      for (const externalId of externalIds) {
        // console.log(`Attempting to identify by externalId: ${k}=${v}`);
        const q = query(
          peopleCol,
          where("externalIds", "array-contains", {
            provider: externalId.provider,
            id: externalId.id,
          }),
          limit(1)
        );

        const snaps = await getDocs(q);
        console.log(
          `ExternalId lookup (${externalId.id}) result count:`,
          snaps.docs.length
        );
        if (snaps.docs.length > 0) {
          personSnap = snaps.docs[0];
          console.log(
            `Person found by externalId (${externalId.id}):`,
            personSnap.data()
          );
        }
        break;
      }
    }

    if (personSnap) {
      const person = personSnap.data() as IPerson;
      return { existing: true, person: person };
    }

    console.log("No existing person found.");
    return { existing: false, person: undefined };
  }

  async create({
    wid,
    name,
    email,
    phone,
    externalIds,
    sessionId,
  }: {
    wid: string;
    name?: string;
    email?: string;
    phone?: string;
    externalIds?: IExternalIds;
    sessionId?: string;
  }) {
    const person = generateDefaultPerson({
      name,
      email,
      phone,
      externalIds,
      sessionId,
    });
    const personRef = doc(db, `workspaces/${wid}/people/${person.id}`);

    await setDoc(personRef, person);
    return person;
  }

  async update({
    wid,
    personId,
    updates,
  }: {
    wid: string;
    personId: string;
    updates: Partial<IPerson>;
  }) {
    const personRef = doc(db, `workspaces/${wid}/people/${personId}`);
    await updateDoc(personRef, updates);

    return this.getPerson(wid, personId);
  }

  async create2({
    wid,
    name,
    emails,
    phones,
    externalIds,
    sessionId,
  }: {
    wid: string;
    name?: string;
    emails: string[];
    phones: string[];
    externalIds?: IExternalIds;
    sessionId?: string;
  }) {
    const person = generateDefaultPerson({
      name,
      email: emails[0],
      phone: phones[0],
      externalIds,
      sessionId,
    });
    const personRef = doc(db, `workspaces/${wid}/people/${person.id}`);
    await setDoc(personRef, person);
    return person;
  }
}

const peopleService = new PeopleService();

export default peopleService;
