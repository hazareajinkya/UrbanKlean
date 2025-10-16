"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/auth/use-user";
import { useMemberActions } from "@/lib/hooks/members/use-member-actions";
import workspaceService from "@/lib/services/workspace-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Mail, Users } from "lucide-react";
import { toast } from "sonner";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { acceptInvitation } = useMemberActions();

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");
  const [message, setMessage] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const wid = searchParams.get("wid");
  const token = searchParams.get("token");

  useEffect(() => {
    const handleInvitation = async () => {
      if (!wid || !token) {
        setStatus("invalid");
        setMessage(
          "Invalid invitation link. Please check the link and try again."
        );
        return;
      }

      if (!user?.email) {
        // User not logged in, redirect to auth with return URL
        const returnUrl = `/accept-invite?wid=${wid}&token=${token}`;
        router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      try {
        const result = await acceptInvitation.mutateAsync({
          wid,
          token,
          userEmail: user.email,
        });

        if (result.success) {
          setStatus("success");
          setMessage("Successfully joined the workspace!");

          // Fetch workspace name
          try {
            const workspace = await workspaceService.fetchWorkspace(wid);
            setWorkspaceName(workspace?.name || "Workspace");
          } catch (error) {
            setWorkspaceName("Workspace");
          }

          // Redirect to workspace after 2 seconds
          setTimeout(() => {
            router.push(`/workspaces/${wid}`);
          }, 2000);
        } else {
          setStatus("error");
          setMessage(result.message || "Failed to accept invitation");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Failed to accept invitation"
        );
      }
    };

    handleInvitation();
  }, [wid, token, user, acceptInvitation, router]);

  const handleGoToWorkspace = () => {
    if (wid) {
      router.push(`/workspaces/${wid}`);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/workspaces");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold">Processing Invitation</h2>
                <p className="text-sm text-gray-600">
                  Please wait while we verify your invitation...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            {status === "success" ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : status === "error" ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <Mail className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <CardTitle>
            {status === "success" ? "Welcome to the team!" : "Invitation Issue"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>You've been added to {workspaceName}</span>
              </div>
              <div className="space-y-2">
                <Button onClick={handleGoToWorkspace} className="w-full">
                  Go to Workspace
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoToDashboard}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                This could happen if:
                <ul className="mt-2 text-left space-y-1">
                  <li>• The invitation has expired</li>
                  <li>• The invitation has already been used</li>
                  <li>• The email doesn't match your account</li>
                </ul>
              </div>
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                Please check that you have the complete invitation link and try
                again.
              </div>
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
