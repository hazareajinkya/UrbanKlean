import {
  collectionGroup,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { IIntegration } from "../types/integration";
import { generateToken, getShopifyProductActionId } from "../utils";
import axiosClient, { shopifyClient } from "../clients/axios-client";
import actionService from "./action-service";
import { IAction } from "../types/actions";

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

  async getShopifyIntegration({
    storeId,
    token,
  }: {
    storeId: string;
    token: string;
  }): Promise<IIntegration | null> {
    const integrationsRef = collectionGroup(db, `integrations`);
    const q = query(
      integrationsRef,
      where("id", "==", storeId),
      where("metadata.token", "==", token)
    );
    const snap = await getDocs(q);

    if (snap.empty) return null;

    return snap.docs[0].data() as IIntegration;
  }

  async disconnectShopifyIntegration({
    storeId,
    wid,
  }: {
    storeId: string;
    wid: string;
  }) {
    await updateDoc(doc(db, `workspaces/${wid}/integrations/${storeId}`), {
      status: "inactive",
      credentials: {
        accessToken: null,
        accessTokenExpiresAt: null,
      },
      updatedAt: new Date().toISOString(),
    });

    // Delete the associated product search action
    try {
      await actionService.deleteAction({
        wid,
        actionId: getShopifyProductActionId(storeId),
      });
    } catch (error) {
      console.error("Error deleting Shopify product action:", error);
    }
  }

  async getActiveShopifyIntegration({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): Promise<IIntegration> {
    const shopify = await getDoc(
      doc(db, `workspaces/${wid}/integrations/${storeId}`)
    );

    if (!shopify.exists()) {
      throw new Error("Shopify integration not found");
    }

    const shopifyData = shopify.data() as IIntegration;

    if (shopifyData.status !== "active") {
      throw new Error("Shopify integration is not active");
    }
    return shopifyData;
  }

  async getActiveShopifyIntegrationByWid({
    wid,
  }: {
    wid: string;
  }): Promise<IIntegration> {
    const integrationsRef = collectionGroup(db, "integrations");
    const q = query(
      integrationsRef,
      where("wid", "==", wid),
      where("type", "==", "shopify"),
      where("status", "==", "active")
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("No active Shopify integration found for this workspace");
    }

    return snap.docs[0].data() as IIntegration;
  }

  async refreshShopifyToken({
    storeId,
    wid,
  }: {
    storeId: string;
    wid: string;
  }): Promise<{
    accessToken: string;
    accessTokenExpiresAt: string;
  }> {
    await this.getActiveShopifyIntegration({ wid, storeId });

    const response = await shopifyClient.post("/refresh-token", {
      shop: storeId,
    });
    const { data } = response.data;

    if (!data?.accessToken || !data?.accessTokenExpiresAt) {
      throw new Error("Invalid response from MagicalCX API");
    }

    return {
      accessToken: data.accessToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
    };
  }

  async updateShopifyIntegration({
    wid,
    storeId,
    status,
    accessToken,
    accessTokenExpiresAt,
  }: {
    wid: string;
    storeId: string;
    status?: "active" | "inactive";
    accessToken?: string;
    accessTokenExpiresAt?: string;
  }) {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (accessToken !== undefined) {
      updateData["credentials.accessToken"] = accessToken;
    }

    if (accessTokenExpiresAt !== undefined) {
      updateData["credentials.accessTokenExpiresAt"] = accessTokenExpiresAt;
    }

    await updateDoc(
      doc(db, `workspaces/${wid}/integrations/${storeId}`),
      updateData
    );
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
    if (status === "inactive") {
      await axiosClient.delete(`/api/shopify`, {
        data: {
          storeId,
          wid,
        },
      });
    }
    await deleteDoc(doc(db, `workspaces/${wid}/integrations/${storeId}`));

    // Delete the associated product search action
    try {
      await actionService.deleteAction({
        wid,
        actionId: getShopifyProductActionId(storeId),
      });
    } catch (error) {
      console.error("Error deleting Shopify product action:", error);
    }
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
  async searchShopifyProducts({
    wid,
    storeId,
    searchQuery,
  }: {
    wid: string;
    storeId: string;
    searchQuery: string;
  }) {
    const integration = await this.getActiveShopifyIntegration({
      wid,
      storeId,
    });
    const response = await shopifyClient.post(`/product-search`, {
      shop: integration.id,
      searchQuery,
    });
    return response.data;
  }

  async activateShopifyIntegration({
    shop,
    accessToken,
    accessTokenExpiresAt,
    apiKey,
  }: {
    shop: string;
    accessToken: string;
    accessTokenExpiresAt: string;
    apiKey: string;
  }) {
    const integration = await this.getShopifyIntegration({
      storeId: shop,
      token: apiKey,
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    await this.updateShopifyIntegration({
      wid: integration.wid,
      storeId: shop,
      status: "active",
      accessToken,
      accessTokenExpiresAt,
    });

    // Create Shopify product search action for this workspace
    const productAction = this.createShopifyProductAction({
      wid: integration.wid,
      storeId: shop,
    });
    await actionService.saveAction({
      wid: integration.wid,
      action: productAction,
    });

    return integration;
  }
  createShopifyProductAction = ({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): IAction => ({
    id: getShopifyProductActionId(storeId),
    wid,
    name: "Search Shopify Products",
    slug: "search_shopify_products",
    description:
      "Search for products in your connected Shopify store by name or keyword",
    type: "integration",
    apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/products`,
    requestType: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    authorization: { type: "none" },
    inputs: [
      {
        key: "searchQuery",
        type: "string",
        required: true,
        description: "Product search term (name, keyword, or description)",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

const shopifyService = new ShopifyService();

export default shopifyService;
