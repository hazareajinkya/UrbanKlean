"use client";
/**
 * TEMPORARY: Remove this page after review approval.
 * URL: /review-access?token=SOME_SECRET_TOKEN — auto-logs into test workspace.
 */
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader, XCircle } from "lucide-react";
import { axiosClient } from "@/lib/clients/axios-client";

const ReviewAccessContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "error" | "signing-in">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing token");
      return;
    }
    const proceed = async () => {
      try {
        const { data: res } = await axiosClient.get<{
          success: boolean;
          data?: { email: string; id: string; workspaceId: string };
          message?: string;
        }>("/api/review-access", { params: { token } });
        if (!res.success || !res.data) {
          setErrorMessage(res.message ?? "Invalid or expired link");
          setStatus("error");
          return;
        }
        setStatus("signing-in");
        await signIn("credentials", {
          email: res.data.email,
          id: res.data.id,
          redirect: true,
          callbackUrl: `/workspaces/${res.data.workspaceId}`,
        });
      } catch {
        setErrorMessage("Invalid or expired link");
        setStatus("error");
      }
    };
    proceed();
  }, [token]);

  if (status === "error")
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-8">
          <XCircle className="h-10 w-10 text-red-500" aria-hidden />
          <p className="text-center font-medium text-zinc-200">{errorMessage}</p>
          <a
            href="/auth"
            className="text-sm text-zinc-400 underline transition hover:text-zinc-200"
          >
            Go to sign in
          </a>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <Loader className="h-8 w-8 animate-spin text-zinc-400" aria-hidden />
        <p className="text-sm text-zinc-400">
          {status === "signing-in" ? "Signing you in…" : "Verifying link…"}
        </p>
      </div>
    </div>
  );
};

export default function ReviewAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <Loader className="h-8 w-8 animate-spin text-zinc-400" aria-hidden />
        </div>
      }
    >
      <ReviewAccessContent />
    </Suspense>
  );
}
