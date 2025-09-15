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

  async updatePerson(wid: string, persondId: string, data: Partial<IPerson>) {
    const personRef = doc(db, `workspaces/${wid}/people/${persondId}`);

    const update: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (data.name !== undefined) update.name = data.name;
    if (data.company !== undefined) update.company = data.company;
    if (data.title !== undefined) update.title = data.title;
    if (data.location !== undefined) update.location = data.location;

    if (data.preferences) {
      for (const [k, v] of Object.entries(data.preferences)) {
        update[`preferences.${k}`] = v;
      }
    }

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
    return update;
  }
}

const customerService = new PeopleService();

export default customerService;
