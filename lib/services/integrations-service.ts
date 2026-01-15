import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { IIntegration } from "../types/integration";
import { db } from "../clients/firebase";

class IntegrationsService {
  async getIntegrations(wid: string): Promise<IIntegration[]> {
    const collectionRef = collection(db, `workspaces/${wid}/integrations`);
    const snap = await getDocs(collectionRef);
    return snap.docs.map((doc) => doc.data() as IIntegration);
  }

  async deleteIntegration({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): Promise<void> {
    await deleteDoc(doc(db, `workspaces/${wid}/integrations/${storeId}`));
  }
}

const integrationsService = new IntegrationsService();
export default integrationsService;
