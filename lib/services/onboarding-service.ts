import { apiClient, backendClient } from "@/lib/clients/axios-client";
import { storage } from "@/lib/clients/firebase";
import { tracingChannel } from "diagnostics_channel";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";
import { OnboardingData } from "@/lib/types/onboarding";
import { backendconf } from "../utils/conf";


class OnboardingService {
  async generateCompanyInfo({ url }: { url: string }) {
    try {
      const response = await apiClient.post("/api/onboarding/generate-info", {
        url,
      });
      return response.data;
    } catch (error) {
      console.log("error: ", error);
    }
  }

  async uploadLogo(file: File): Promise<string> {
    const fileExtension = file.name.split(".").pop() || "png";
    const fileName = `onboarding-logos/${uuid()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  }

  async startOnboarding(data: {
    email: string;
    url: string;
    onboardingData: OnboardingData;
  }) {
    const response = await apiClient.post("/api/onboarding/start", data);
    return response.data;
  }
}

const onboardingService = new OnboardingService();

export default onboardingService;
