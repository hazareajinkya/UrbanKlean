import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  limit,
  where,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { apiClient } from "../clients/axios-client";
import { IApp, IInstalledApp } from "../types/app";

export interface ConnectAppResponse {
  mode: string;
  authorizationUrl?: string;
  message?: string;
}

export interface InstallAppResponse {
  success: boolean;
  message?: string;
}

class AppService {
  getAppBySlug = async (slug: string): Promise<IApp | null> => {
    const appsRef = collection(db, "apps");
    const q = query(
      appsRef,
      where("slug", "==", slug.trim()),
      where("status", "==", "published"),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const data = snap.docs[0].data() as IApp;
    return data;
  };

  getPublishedApps = async (): Promise<IApp[]> => {
    const appsRef = collection(db, "apps");
    const q = query(appsRef, where("status", "==", "published"));
    const snap = await getDocs(q);
    const data = snap.docs
      .map((snapshot) => snapshot.data() as IApp)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return data;
  };

  getInstalledApps = async (wid: string): Promise<IInstalledApp[]> => {
    const collectionRef = collection(db, `workspaces/${wid}/apps`);
    const snap = await getDocs(collectionRef);
    return snap.docs.map((d) => d.data() as IInstalledApp);
  };

  uninstallApp = async ({
    wid,
    appId,
  }: {
    wid: string;
    appId: string;
  }): Promise<void> => {
    await deleteDoc(doc(db, `workspaces/${wid}/apps/${appId}`));
  };

  connectApp = async ({
    slug,
    workspaceId,
    callbackRedirectUrl,
  }: {
    slug: string;
    workspaceId: string;
    callbackRedirectUrl: string;
  }): Promise<ConnectAppResponse> => {
    const response = await apiClient.post<{ data: ConnectAppResponse }>(
      `/api/apps/${slug}/connect`,
      { workspaceId, callbackRedirectUrl },
    );
    return response.data.data || response.data;
  };

  installApp = async ({
    slug,
    workspaceId,
    credentials,
  }: {
    slug: string;
    workspaceId: string;
    credentials: Record<string, any>;
  }): Promise<InstallAppResponse> => {
    const response = await apiClient.post<{ data: InstallAppResponse }>(
      `/api/apps/${slug}/install`,
      { workspaceId, credentials },
    );
    return response.data.data || response.data;
  };
}

const appService = new AppService();
export default appService;
