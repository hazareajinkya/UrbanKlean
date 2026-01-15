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
import {
  generateToken,
  getShopifyProductActionId,
  getShopifyTrackOrderActionId,
  getShopifyCancelOrderActionId,
  getShopifyRefundOrderActionId,
  getShopifyReturnOrderActionId,
  getShopifyChangeShippingAddressActionId,
} from "../utils";
import axiosClient, { shopifyClient } from "../clients/axios-client";
import actionService from "./action-service";
import { IAction } from "../types/actions";
import axios from "axios";

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

    // Delete all associated Shopify actions
    const actionIds = [
      getShopifyProductActionId(storeId),
      getShopifyTrackOrderActionId(storeId),
      getShopifyCancelOrderActionId(storeId),
      getShopifyRefundOrderActionId(storeId),
      getShopifyReturnOrderActionId(storeId),
      getShopifyChangeShippingAddressActionId(storeId),
    ];

    await Promise.all(
      actionIds.map((actionId) =>
        actionService
          .deleteAction({ wid, actionId })
          .catch((error) =>
            console.error(`Error deleting Shopify action ${actionId}:`, error)
          )
      )
    );
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

    // Delete all associated Shopify actions
    const actionIds = [
      getShopifyProductActionId(storeId),
      getShopifyTrackOrderActionId(storeId),
      getShopifyCancelOrderActionId(storeId),
      getShopifyRefundOrderActionId(storeId),
      getShopifyReturnOrderActionId(storeId),
      getShopifyChangeShippingAddressActionId(storeId),
    ];

    await Promise.all(
      actionIds.map((actionId) =>
        actionService
          .deleteAction({ wid, actionId })
          .catch((error) =>
            console.error(`Error deleting Shopify action ${actionId}:`, error)
          )
      )
    );
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
    storeId,
    searchQuery,
  }: {
    storeId: string;
    searchQuery: string;
  }) {
    if (!searchQuery?.trim()) {
      throw new Error("Search query is required");
    }

    const mcpEndpoint = `https://${storeId}/api/mcp`;

    try {
      const response = await axios.post(
        mcpEndpoint,
        {
          jsonrpc: "2.0",
          method: "tools/call",
          id: Date.now(),
          params: {
            name: "search_shop_catalog",
            arguments: {
              query: searchQuery.trim(),
              context:
                "Carefully analyze and find products that match the mentioned query. Ensure all search criteria are met and return the most relevant results.",
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (response.data?.error) {
        throw new Error(
          response.data.error.message || "MCP API returned an error"
        );
      }

      const result = response.data?.result;
      const isError = result?.isError ?? false;

      if (isError) {
        throw new Error("Shopify MCP returned an error");
      }

      const textContent = result?.content?.[0]?.text;
      if (!textContent) {
        throw new Error("No content returned from Shopify MCP");
      }

      const parsedContent = JSON.parse(textContent);
      console.log(parsedContent);
      return {
        products: parsedContent,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            `Shopify MCP API error: ${error.response.status} - ${
              error.response.data?.message || error.message
            }`
          );
        }
        if (error.request) {
          throw new Error(
            `Failed to connect to Shopify MCP endpoint: ${error.message}`
          );
        }
      }
      throw error;
    }
  }

  async changeShippingAddress({
    shop,
    orderId,
    shippingAddress,
  }: {
    shop: string;
    orderId: string;
    shippingAddress: {
      firstName?: string;
      lastName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      provinceCode?: string;
      countryCode?: string;
      zip?: string;
      phone?: string;
      company?: string;
    };
  }) {
    const response = await shopifyClient.post("/change-shipment-address", {
      shop,
      orderId,
      shippingAddress,
    });
    return response.data;
  }

  async trackOrder({
    shop,
    orderId,
    orderNumber,
    email,
  }: {
    shop: string;
    orderId?: string;
    orderNumber?: string;
    email?: string;
  }) {
    const payload: Record<string, string> = { shop };

    if (orderId) payload.orderId = orderId;
    if (orderNumber) payload.orderNumber = orderNumber;
    if (email) payload.email = email;

    const response = await shopifyClient.post("/track-order", payload);
    return response.data;
  }

  async cancelOrder({
    shop,
    orderId,
    orderNumber,
    staffNote,
  }: {
    shop: string;
    orderId?: string;
    orderNumber?: string;
    staffNote?: string;
  }) {
    const payload: Record<string, unknown> = {
      shop,
    };

    if (orderId) payload.orderId = orderId;
    if (orderNumber) payload.orderNumber = orderNumber;
    if (staffNote !== undefined) payload.staffNote = staffNote;

    try {
      const response = await shopifyClient.post("/cancel-order", payload);
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.error?.message) {
        return {
          success: false,
          error: errorData.error.message,
        };
      }
      throw error;
    }
  }

  async refundOrder({
    shop,
    orderId,
    orderNumber,
    note,
    fullRefund,
  }: {
    shop: string;
    orderId?: string;
    orderNumber?: string;
    note?: string;
    fullRefund?: boolean;
  }) {
    const payload: Record<string, unknown> = {
      shop,
    };

    if (orderId) payload.orderId = orderId;
    if (orderNumber) payload.orderNumber = orderNumber;
    if (note !== undefined) payload.note = note;
    if (fullRefund !== undefined) payload.fullRefund = fullRefund;

    const response = await shopifyClient.post("/refund-order", payload);
    return response.data;
  }

  async returnOrder({
    shop,
    orderId,
    orderNumber,
    returnReasonNote,
  }: {
    shop: string;
    orderId?: string;
    orderNumber?: string;
    returnReasonNote?: string;
  }) {
    const payload: Record<string, unknown> = {
      shop,
    };

    if (orderId) payload.orderId = orderId;
    if (orderNumber) payload.orderNumber = orderNumber;
    if (returnReasonNote) payload.returnReasonNote = returnReasonNote;

    const response = await shopifyClient.post("/return-order", payload);
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

    // Create all Shopify actions for this workspace
    const actions = [
      this.createShopifyProductAction({
        wid: integration.wid,
        storeId: shop,
      }),
      this.createShopifyTrackOrderAction({
        wid: integration.wid,
        storeId: shop,
      }),
      this.createShopifyCancelOrderAction({
        wid: integration.wid,
        storeId: shop,
      }),
      this.createShopifyRefundOrderAction({
        wid: integration.wid,
        storeId: shop,
      }),
      this.createShopifyReturnOrderAction({
        wid: integration.wid,
        storeId: shop,
      }),
      this.createShopifyChangeShippingAddressAction({
        wid: integration.wid,
        storeId: shop,
      }),
    ];

    await Promise.all(
      actions.map((action) =>
        actionService.saveAction({ wid: integration.wid, action })
      )
    );

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
    name: "Shopify Products Search",
    slug: "shopify_products_search",
    description:
      "Search for products in your connected Shopify store by name or keyword",
    type: "integration",
    apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/shopify/search-products`,
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

  createShopifyTrackOrderAction = ({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): IAction => ({
    id: getShopifyTrackOrderActionId(storeId),
    wid,
    name: "Shopify Track Order",
    slug: "shopify_track_order",
    description:
      "Track the status and fulfillment details of a Shopify order using order ID, order number, or customer email",
    type: "integration",
    apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/shopify/track-order`,
    requestType: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    authorization: { type: "none" },
    inputs: [
      {
        key: "orderId",
        type: "string",
        required: false,
        description: "The Shopify order ID (e.g., gid://shopify/Order/123)",
      },
      {
        key: "orderNumber",
        type: "string",
        required: false,
        description: "The order number displayed to the customer (e.g., #1001)",
      },
      {
        key: "email",
        type: "string",
        required: false,
        description: "Customer email address to find associated orders",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  createShopifyCancelOrderAction = ({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): IAction => ({
    id: getShopifyCancelOrderActionId(storeId),
    wid,
    name: "Shopify Cancel Order",
    slug: "shopify_cancel_order",
    description:
      "Cancel a Shopify order. Automatically restocks items and notifies the customer",
    type: "integration",
    apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/shopify/cancel-order`,
    requestType: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    authorization: { type: "none" },
    inputs: [
      {
        key: "orderId",
        type: "string",
        required: false,
        description:
          "The Shopify order ID to cancel (e.g., gid://shopify/Order/123)",
      },
      {
        key: "orderNumber",
        type: "string",
        required: false,
        description: "The order number displayed to the customer (e.g., #1001)",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  createShopifyRefundOrderAction = ({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): IAction => ({
    id: getShopifyRefundOrderActionId(storeId),
    wid,
    name: "Shopify Refund Order",
    slug: "shopify_refund_order",
    description: "Process a full refund for a Shopify order",
    type: "integration",
    apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/shopify/refund-order`,
    requestType: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    authorization: { type: "none" },
    inputs: [
      {
        key: "orderId",
        type: "string",
        required: false,
        description:
          "The Shopify order ID to refund (e.g., gid://shopify/Order/123)",
      },
      {
        key: "orderNumber",
        type: "string",
        required: false,
        description: "The order number displayed to the customer (e.g., #1001)",
      },
      {
        key: "note",
        type: "string",
        required: false,
        description: "Optional note explaining the reason for the refund",
      },
      {
        key: "fullRefund",
        type: "boolean",
        required: false,
        description: "Whether to process a full refund (default: true)",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  createShopifyReturnOrderAction = ({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): IAction => ({
    id: getShopifyReturnOrderActionId(storeId),
    wid,
    name: "Shopify Return Order",
    slug: "shopify_return_order",
    description: "Initiate a return request for items in a Shopify order",
    type: "integration",
    apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/shopify/return-order`,
    requestType: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    authorization: { type: "none" },
    inputs: [
      {
        key: "orderNumber",
        type: "string",
        required: false,
        description: "The order number displayed to the customer (e.g., #1001)",
      },
      {
        key: "orderId",
        type: "string",
        required: false,
        description:
          "The Shopify order ID for the return (e.g., gid://shopify/Order/123)",
      },
      {
        key: "returnReasonNote",
        type: "string",
        required: false,
        description: "The reason for the return",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  createShopifyChangeShippingAddressAction = ({
    wid,
    storeId,
  }: {
    wid: string;
    storeId: string;
  }): IAction => ({
    id: getShopifyChangeShippingAddressActionId(storeId),
    wid,
    name: "Shopify Change Shipping Address",
    slug: "shopify_change_shipping_address",
    description: "Update the shipping address for an existing Shopify order",
    type: "integration",
    apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/shopify/change-shipping-address`,
    requestType: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    authorization: { type: "none" },
    inputs: [
      {
        key: "orderId",
        type: "string",
        required: true,
        description:
          "The Shopify order ID to update (e.g., gid://shopify/Order/123)",
      },
      {
        key: "firstName",
        type: "string",
        required: false,
        description: "Recipient's first name",
      },
      {
        key: "lastName",
        type: "string",
        required: false,
        description: "Recipient's last name",
      },
      {
        key: "address1",
        type: "string",
        required: false,
        description: "Primary street address",
      },
      {
        key: "address2",
        type: "string",
        required: false,
        description: "Apartment, suite, unit, etc.",
      },
      {
        key: "city",
        type: "string",
        required: false,
        description: "City name",
      },
      {
        key: "provinceCode",
        type: "string",
        required: false,
        description: "State/province code (e.g., CA, NY)",
      },
      {
        key: "countryCode",
        type: "string",
        required: false,
        description: "Two-letter country code (e.g., US, CA)",
      },
      {
        key: "zip",
        type: "string",
        required: false,
        description: "Postal/ZIP code",
      },
      {
        key: "phone",
        type: "string",
        required: false,
        description: "Contact phone number",
      },
      {
        key: "company",
        type: "string",
        required: false,
        description: "Company or organization name",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

const shopifyService = new ShopifyService();

export default shopifyService;
