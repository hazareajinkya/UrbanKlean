"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/workspaces");
    }
  }, [countdown, router]);

  const handleGoToDashboard = () => {
    router.push("/workspaces");
  };

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
