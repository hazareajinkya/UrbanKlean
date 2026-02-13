import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { IIntegration, IntegrationType } from "../types/integration";
import { db } from "../clients/firebase";

class IntegrationsService {
  async getIntegrations(wid: string): Promise<IIntegration[]> {
    const collectionRef = collection(db, `workspaces/${wid}/integrations`);
    const snap = await getDocs(collectionRef);
    return snap.docs.map((doc) => doc.data() as IIntegration);
  }

  async addIntegration({
    wid,
    type,
    integrationId,
    metadata,
  }: {
    wid: string;
    type: IntegrationType;
    integrationId: string;
    metadata?: Record<string, string>;
  }): Promise<IIntegration> {
    const integration: IIntegration = {
      id: integrationId,
      wid,
      status: "active",
      type,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(
      doc(db, `workspaces/${wid}/apps/${integrationId}`),
      integration,
    );

    return integration;
  }

  async deleteIntegration({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): Promise<void> {
    await deleteDoc(doc(db, `workspaces/${wid}/apps/${storeId}`));
  }
}

const integrationsService = new IntegrationsService();
export default integrationsService;
