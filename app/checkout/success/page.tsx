"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader, Loader2 } from "lucide-react";
import { useCurrentUser, userKey } from "@/lib/hooks/user/use-user";
import { useQueryClient } from "@tanstack/react-query";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [countdown, setCountdown] = useState(5);
  const [hasSubscription, setHasSubscription] = useState(false);

  const plan = searchParams.get("plan");
  const tier = searchParams.get("tier");

  const qc = useQueryClient();
  // Poll for subscription status - webhook will sync it
  const { user, refetch } = useCurrentUser();

  // Check if subscription has been synced by webhook
  useEffect(() => {
    if (user?.subscription?.status) {
      const subscriptionStatus = user.subscription.status;
      const isActive =
        subscriptionStatus !== "canceled" && subscriptionStatus !== "past_due";
      if (isActive) {
        setHasSubscription(true);
      }
    }
  }, [user]);

  // Poll for subscription sync (webhook may take a few seconds)
  useEffect(() => {
    if (hasSubscription) return;

    if (!user?.email) return;

    const pollInterval = setInterval(() => {
      qc.invalidateQueries({ queryKey: userKey(user.email) });
    }, 2000); // Poll every 2 seconds

    // Stop polling after 30 seconds
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      // Show success anyway - webhook will sync eventually
      setHasSubscription(true);
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [hasSubscription, user?.email]);

  // Countdown timer
  useEffect(() => {
    if (!hasSubscription) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasSubscription]);

  // Redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push("/workspaces");
    }
  }, [countdown, router]);

  useEffect(() => {
    if (!user?.email) return;

    qc.invalidateQueries({ queryKey: userKey(user.email) });
  }, [user]);
  const handleGoToDashboard = () => {
    router.push("/workspaces");
  };

  if (!hasSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <Loader className="w-12 h-12 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-medium">
              Activating your subscription...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we activate your subscription. This usually
              takes just a few seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-medium">Thank you for your purchase!</h1>
          <p className="text-muted-foreground">
            Your subscription has been successfully activated.
          </p>
        </div>
        <div
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200"
          role="status"
          aria-live="polite"
        >
          It may take up to 2-3 mins to reflect subscription on your account.
        </div>

        <div className="space-y-4">
          <Button onClick={handleGoToDashboard} className="w-full" size="lg">
            Go to Dashboard
          </Button>
          <p className="text-sm text-muted-foreground">
            Redirecting you to your dashboard in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-medium">Loading...</h1>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
