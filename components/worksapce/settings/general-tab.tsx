"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash, Settings2, AlertTriangle } from "lucide-react";

import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import { IWorkspace } from "@/lib/types/workspace";

interface GeneralTabProps {
  workspace: IWorkspace;
  wid: string;
}
export function GeneralTab({ workspace, wid }: GeneralTabProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const { updateWorkspace } = useWorkspaceActions();

  useEffect(() => {
    if (!workspace) return;
    setWorkspaceName(workspace.name || "");
    setWorkspaceDescription(workspace.oneLiner || "");
  }, [workspace]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateWorkspace.mutateAsync({
      wid,
      updates: {
        name: workspaceName.trim(),
        oneLiner: workspaceDescription.trim(),
      },
    });
  };

  return (
    <motion.div
      key="general"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* General Information Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-medium">General Information</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your workspace name and description.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>
                  Workspace Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Enter your workspace name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  required
                  disabled={updateWorkspace.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label>Workspace Description</Label>
                <Textarea
                  placeholder="Describe what this workspace is used for (optional)"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateWorkspace.isPending || !workspaceName.trim()}
                  className="min-w-[120px]"
                >
                  {updateWorkspace.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Danger Zone Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-medium text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Irreversible and destructive actions. Proceed with caution.
          </p>
        </div>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Trash className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive">
                  Delete Workspace
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Once you delete a workspace, there is no going back. This
                  action will permanently delete all workspace data, including
                  agents, knowledge bases, members, and all associated content.
                </p>
                <div className="mt-4">
                  <Button variant="destructive" disabled>
                    Delete Workspace
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
