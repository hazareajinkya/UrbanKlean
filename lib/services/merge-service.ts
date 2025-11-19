import {
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
    await peopleService.update({
      wid,
      personId: updateId,
      updates: personData,
    });
    if (otherIds.length === 0) {
      return;
    }
    // Update all session with new person ID
    await this.updateMergedSession(updateId, otherIds);
    // Delete same person from other person ID
    await Promise.all(
      otherIds.map((pid) =>
        deleteDoc(doc(db, `workspaces/${wid}/people/${pid}`))
      )
    );
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
