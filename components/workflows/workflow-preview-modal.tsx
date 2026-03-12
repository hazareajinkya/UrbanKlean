import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IWorkflow } from "@/lib/types/workflow";
import { IAction } from "@/lib/types/actions";
import { Badge } from "@/components/ui/badge";
import { Wrench, Loader2, X } from "lucide-react";
import React from "react";
import Image from "next/image";

interface WorkflowPreviewModalProps {
  workflow: IWorkflow | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  globalActions?: IAction[];
  isProcessing?: boolean;
}

export function WorkflowPreviewModal({
  workflow,
  isOpen,
  onClose,
  onConfirm,
  globalActions = [],
  isProcessing = false,
}: WorkflowPreviewModalProps) {
  if (!workflow) return null;

  const workflowTools = workflow.toolIds
    .map((toolId) => globalActions.find((a) => a.id === toolId))
    .filter((a): a is IAction => !!a);

  const uniqueAppsMap = new Map();
  workflowTools.forEach((tool) => {
    if (tool.app?.slug && !uniqueAppsMap.has(tool.app.slug)) {
      uniqueAppsMap.set(tool.app.slug, tool.app);
    }
  });
  const uniqueApps = Array.from(uniqueAppsMap.values());

  return (
    <Modal
      isOpen={isOpen}
      closeModal={!isProcessing ? onClose : () => {}}
      className="w-full max-w-2xl bg-background border shadow-lg rounded-xl relative p-0 overflow-hidden"
    >
      <div className="absolute right-4 top-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={isProcessing}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium">{workflow.name}</h2>
            <p className="text-sm text-muted-foreground line-clamp-1 font-normal">
              Add this workflow to your workspace to automate related tasks.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 pb-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Trigger</h4>
          <div className="text-sm  text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {workflow.trigger}
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Prompt</h4>
          <ScrollArea className="h-32 w-full rounded-lg border bg-muted/30 p-4">
            <div className="text-sm font-normal text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {workflow.instructions}
            </div>
          </ScrollArea>
        </div>

        {uniqueApps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Integrated Apps
            </h4>
            <div className="flex flex-wrap gap-2">
              {uniqueApps.map((app) => (
                <div
                  key={app.slug}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border"
                >
                  {app.icon && (
                    <div className="relative w-4 h-4 rounded-sm overflow-hidden flex-shrink-0 bg-white">
                      <Image
                        src={app.icon}
                        alt={app.name || "App"}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="text-sm font-normal text-foreground">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Actions</h4>
          <div className="flex flex-wrap gap-2">
            {workflowTools.length === 0 ? (
              <span className="text-sm font-normal text-muted-foreground italic">
                No actions required
              </span>
            ) : (
              workflowTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border"
                >
                  {tool.app?.icon ? (
                    <div className="relative w-4 h-4 rounded-sm overflow-hidden flex-shrink-0 bg-white">
                      <Image
                        src={tool.app.icon}
                        alt={tool.app.name || "App"}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-normal text-foreground">
                    {tool.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t bg-muted/20 p-4 px-6 mt-auto">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          className="font-medium"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isProcessing}
          className="font-medium min-w-[100px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding
            </>
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </Modal>
  );
}
