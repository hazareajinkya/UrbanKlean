import { useMutation } from "@tanstack/react-query";
import { handleError } from "@/lib/utils";
import onboardingService from "@/lib/services/onboarding-service";

export const useOnboardingActions = () => {
  const startOnboarding = useMutation({
    mutationFn: onboardingService.startOnboarding,
    onError: handleError,
  });

  return { startOnboarding };
};
