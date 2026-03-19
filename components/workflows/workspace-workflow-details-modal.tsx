"use client";

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IWorkflow } from "@/lib/types/workflow";
import { IAction } from "@/lib/types/actions";
import { Pencil, Trash2, X, ListTree, Wrench, Bot, Users } from "lucide-react";
import Image from "next/image";
import { useAgents } from "@/lib/hooks/agent/use-agent";
import { useParams } from "next/navigation";

interface WorkspaceWorkflowDetailsModalProps {
  workflow: IWorkflow | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (workflow: IWorkflow) => void;
  onDelete: (workflow: IWorkflow) => void;
  workspaceActions?: IAction[];
}

export function WorkspaceWorkflowDetailsModal({
  workflow,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  workspaceActions = [],
}: WorkspaceWorkflowDetailsModalProps) {
  const { wid } = useParams() as { wid: string };
  const { agents } = useAgents(wid);

  if (!workflow) return null;

  const workflowTools = workflow.toolIds
    .map((id) => workspaceActions.find((a) => a.id === id))
    .filter((a): a is IAction => !!a);
  const uniqueAppsMap = new Map<string, { slug?: string; name: string; icon: string }>();
  workflowTools.forEach((t) => {
    if (t.app?.slug && !uniqueAppsMap.has(t.app.slug))
      uniqueAppsMap.set(t.app.slug, { slug: t.app.slug, name: t.app.name, icon: t.app.icon });
  });
  const uniqueApps = Array.from(uniqueAppsMap.values());
  const assignedAgents = agents?.filter((a) => workflow.aids?.includes(a.id)) ?? [];

  const handleEdit = () => {
    onClose();
    onEdit(workflow);
  };

  const handleDelete = () => {
    onClose();
    onDelete(workflow);
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="w-full max-w-xl bg-card border rounded-xl relative p-0 overflow-hidden"
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <ListTree className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-medium truncate">{workflow.name}</h2>
              <p className="text-sm text-muted-foreground truncate">Workflow details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Trigger</h4>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {workflow.trigger}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Instructions</h4>
            <ScrollArea className="h-32 w-full rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {workflow.instructions}
              </div>
            </ScrollArea>
          </div>

          {uniqueApps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Integrated Apps</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueApps.map((app) => (
                  <div
                    key={app.slug ?? app.name}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border"
                  >
                    {app.icon && (
                      <div className="relative w-4 h-4 rounded-sm overflow-hidden flex-shrink-0 bg-white">
                        <Image src={app.icon} alt={app.name} fill className="object-contain" />
                      </div>
                    )}
                    <span className="text-sm text-foreground">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Actions</h4>
            <div className="flex flex-wrap gap-2">
              {workflowTools.length === 0 ? (
                <span className="text-sm text-muted-foreground italic">No actions required</span>
              ) : (
                workflowTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border"
                  >
                    {tool.app?.icon ? (
                      <div className="relative w-4 h-4 rounded-sm overflow-hidden flex-shrink-0 bg-white">
                        <Image src={tool.app.icon} alt={tool.app.name} fill className="object-contain" />
                      </div>
                    ) : (
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">{tool.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {assignedAgents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Assigned Agents
              </h4>
              <div className="flex flex-wrap gap-2">
                {assignedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                      style={{ backgroundColor: agent.customization.primaryColor }}
                    >
                      {agent.customization.botIcon ? (
                        <img
                          src={agent.customization.botIcon}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{agent.customization.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-muted/20 p-4 px-6">
          <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
