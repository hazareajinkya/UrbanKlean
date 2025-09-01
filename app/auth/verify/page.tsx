"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "../../../lib/hooks/user/use-auth-actions";

export default function VerifyEmail() {
  const router = useRouter();
  const { verifyEmailLink } = useAuthActions();

  useEffect(() => {
    verifyEmailLink.mutate();
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gray-50 dark:bg-background p-6 md:p-10">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
}
