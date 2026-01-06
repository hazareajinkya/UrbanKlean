import { useMutation } from "@tanstack/react-query";
import { handleError } from "@/lib/utils";
import onboardingService from "@/lib/services/onboarding-service";
import { useRouter } from "next/navigation";

export const useOnboardingActions = () => {
  const router = useRouter();

  const generateOnboardingInfo = useMutation({
    mutationFn: onboardingService.generateCompanyInfo,
    onError: handleError,
  });

  const uploadLogo = useMutation({
    mutationFn: onboardingService.uploadLogo,
    onError: handleError,
  });

  const startOnboarding = useMutation({
    mutationFn: onboardingService.startOnboarding,
    onError: handleError,
  });

  return { generateOnboardingInfo, uploadLogo, startOnboarding };
};
