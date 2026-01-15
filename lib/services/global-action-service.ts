import { getDocs, collection, query, where } from "firebase/firestore";
import { IAction } from "../types/actions";
import { db } from "../clients/firebase";

class GlobalActionService {
  async getGlobalActions(filters?: {
    type?: IAction["type"];
    integration?: IAction["integration"];
  }): Promise<IAction[]> {
    const collectionRef = collection(db, "actions");
    let q = query(collectionRef);

    if (filters?.type) {
      q = query(collectionRef, where("type", "==", filters.type));
    }

    const snap = await getDocs(q);
    let actions = snap.docs.map((doc) => doc.data() as IAction);

    // Filter by integration in memory (Firestore doesn't support multiple where clauses easily)
    if (filters?.integration && filters.integration !== "none") {
      actions = actions.filter(
        (action) => action.integration === filters.integration
      );
    }

    return actions;
  }

  async getGlobalActionsByIntegrations(
    integrationTypes: string[]
  ): Promise<IAction[]> {
    if (integrationTypes.length === 0) return [];

    const collectionRef = collection(db, "actions");
    const q = query(collectionRef, where("type", "==", "integration"));

    const snap = await getDocs(q);
    const actions = snap.docs.map((doc) => doc.data() as IAction);

    // Filter by integration types
    return actions.filter((action) =>
      integrationTypes.includes(action.integration)
    );
  }
}

const globalActionService = new GlobalActionService();
export default globalActionService;
