import {
  arrayRemove,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { IPerson } from "../types/person";
import { db } from "../clients/firebase";
import { IChannelProvider } from "../types/channel";
import peopleService from "./people-service";

class MergeService {
  updateMergePerson = async (
    updateId: string,
    otherIds: string[],
    personData: IPerson,
    wid: string
  ) => {
    const allMergedIds = [updateId, ...otherIds];

    await peopleService.update({
      wid,
      personId: updateId,
      updates: personData,
    });
    if (otherIds.length === 0) {
      return;
    }

    // Clean up identicalPersonIds references in other persons
    await this.cleanupIdenticalPersonIds(wid, allMergedIds, updateId);

    // Update all session with new person ID
    await this.updateMergedSession(updateId, otherIds);

    // Delete same person from other person ID
    await Promise.all(
      otherIds.map((pid) =>
        deleteDoc(doc(db, `workspaces/${wid}/people/${pid}`))
      )
    );
  };

  cleanupIdenticalPersonIds = async (
    wid: string,
    mergedIds: string[],
    keepId: string
  ) => {
    try {
      // Get all persons that might reference the merged persons
      const peopleCol = collection(db, `workspaces/${wid}/people`);
      const peopleSnap = await getDocs(peopleCol);

      const updatePromises: Promise<void>[] = [];

      peopleSnap.docs.forEach((docSnap) => {
        const person = docSnap.data() as IPerson;
        const personId = person.id;

        // Skip if this person is one of the merged persons
        if (mergedIds.includes(personId)) {
          return;
        }

        // Check if this person has any of the merged IDs in their identicalPersonIds
        if (person.identicalPersonIds && person.identicalPersonIds.length > 0) {
          const hasMergedIds = mergedIds.some((mergedId) =>
            person.identicalPersonIds.includes(mergedId)
          );

          if (hasMergedIds) {
            // Remove all merged IDs from this person's identicalPersonIds
            const personRef = doc(db, `workspaces/${wid}/people/${personId}`);

            // Filter out all merged IDs
            const newIdenticalIds = person.identicalPersonIds.filter(
              (id) => !mergedIds.includes(id)
            );

            // Update the person with cleaned identicalPersonIds
            updatePromises.push(
              updateDoc(personRef, {
                identicalPersonIds: newIdenticalIds,
                updatedAt: new Date().toISOString(),
              })
            );
          }
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error cleaning up identicalPersonIds:", error);
      // Don't throw - this is cleanup, shouldn't fail the merge
    }
  };

  updateMergedSession = async (updateId: string, otherIds: string[]) => {
    if (otherIds.length === 0) {
      return;
    }
    // get all session that with oother person ID
    const q = otherIds.map((otherId) =>
      query(collectionGroup(db, "sessions"), where("personId", "==", otherId))
    );

    const results = await Promise.all(q.map((q) => getDocs(q)));

    const updatePromises: Promise<void>[] = [];
    // Update all sessions
    results.forEach((snap) => {
      snap.docs.forEach((doc) => {
        updatePromises.push(updateDoc(doc.ref, { personId: updateId }));
      });
    });

    await Promise.all(updatePromises);
  };

  notMergePersons = async (
    wid: string,
    personAId: string,
    personBId: string
  ) => {
    const personARef = doc(db, `workspaces/${wid}/people/${personAId}`);
    const personBRef = doc(db, `workspaces/${wid}/people/${personBId}`);
    await updateDoc(personARef, {
      identicalPersonIds: arrayRemove(personBId),
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(personBRef, {
      identicalPersonIds: arrayRemove(personAId),
      updatedAt: new Date().toISOString(),
    });
  };

  resolvePrimaryAndOthers = (records: IPerson[]) => {
    const sortedByCreatedAt = records
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
      );

    const primaryId = sortedByCreatedAt[0]?.id;
    const otherIds = sortedByCreatedAt.slice(1).map((person) => person.id);

    return {
      primaryId,
      otherIds,
    };
  };
}
export const mergeService = new MergeService();
