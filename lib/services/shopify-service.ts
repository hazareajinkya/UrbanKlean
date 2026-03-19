import {
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { IIntegration } from "../types/integration";
import {
  generateToken,
} from "../utils";
import axiosClient from "../clients/axios-client";

class ShopifyService {
  async addShopifyIntegration({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): Promise<IIntegration> {
    const token = generateToken();
    const metadata = {
      token,
      storeId,
    };
    const integration: IIntegration = {
      id: storeId,
      wid,
      type: "shopify",
      metadata,
      status: "inactive",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(
      doc(db, `workspaces/${wid}/integrations/${storeId}`),
      integration
    );

    return integration;
  }
  async regenerateToken({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): Promise<string> {
    const newToken = generateToken();
    await updateDoc(doc(db, `workspaces/${wid}/integrations/${storeId}`), {
      "metadata.token": newToken,
      updatedAt: new Date().toISOString(),
    });
    return newToken;
  }
  async deleteShopifyIntegration({
    wid,
    storeId,
    status,
  }: {
    wid: string;
    storeId: string;
    status?: "active" | "inactive";
  }) {
    await axiosClient.delete(`/api/integrations/shopify`, {
      data: {
        storeId,
        wid,
        status,
      },
    });



  }

}

const shopifyService = new ShopifyService();

export default shopifyService;
