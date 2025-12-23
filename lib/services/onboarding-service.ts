import { apiClient } from "@/lib/clients/axios-client";
class OnboardingService {
  async startOnboarding({ email, url }: { email: string; url: string }) {
    const response = await apiClient.post("/api/onboarding", { email, url });
    return response.data;
  }
}

const onboardingService = new OnboardingService();

export default onboardingService;
