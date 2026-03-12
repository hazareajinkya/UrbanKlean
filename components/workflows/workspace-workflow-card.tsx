"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  Plus,
  Check,
  Wrench,
  Users,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { IWorkflow } from "@/lib/types/workflow";
import { useAgents } from "@/lib/hooks/agent/use-agent";
import { useGlobalActions } from "@/lib/hooks/actions/use-ai-actions";
import { useParams } from "next/navigation";

interface WorkspaceWorkflowCardProps {
  workflow: IWorkflow;
  onToggleStatus: (workflowId: string, isActive: boolean) => void;
  onEdit: (workflow: IWorkflow) => void;
  onDelete: (workflow: IWorkflow) => void;
  onUpdateAgents: (workflowId: string, aids: string[]) => void | Promise<void>;
}

export const WorkspaceWorkflowCard = ({
  workflow,
  onToggleStatus,
  onEdit,
  onDelete,
  onUpdateAgents,
}: WorkspaceWorkflowCardProps) => {
  const { wid } = useParams() as { wid: string };
  const { agents } = useAgents(wid);
  const { globalActions } = useGlobalActions();
  const [agentPopoverOpen, setAgentPopoverOpen] = useState(false);
  const [updatingAgentId, setUpdatingAgentId] = useState<string | null>(null);

  const handleToggle = (checked: boolean) => {
    onToggleStatus(workflow.id, checked);
  };

  const isAgentAssigned = (agentId: string) => {
    return workflow.aids?.includes(agentId) ?? false;
  };

  const handleToggleAgent = async (agentId: string) => {
    try {
      setUpdatingAgentId(agentId);
      const currentAids = workflow.aids ?? [];
      const newAids = currentAids.includes(agentId)
        ? currentAids.filter((id) => id !== agentId)
        : [...currentAids, agentId];
      await onUpdateAgents(workflow.id, newAids);
    } finally {
      setUpdatingAgentId(null);
      setAgentPopoverOpen(false);
    }
  };

  const assignedAgents =
    agents?.filter((a) => workflow.aids?.includes(a.id)) ?? [];
  const isIntegration = workflow.type != "user";

  const workflowActions =
    globalActions?.filter((a) => workflow.toolIds.includes(a.id)) || [];

  const uniqueAppsMap = new Map();
  workflowActions.forEach((action) => {
    if (action.app?.slug && !uniqueAppsMap.has(action.app.slug)) {
      uniqueAppsMap.set(action.app.slug, action.app);
    }
  });
  const uniqueApps = Array.from(uniqueAppsMap.values());

  return (
    <div className="group relative flex flex-col p-5 bg-card hover:bg-muted/30 border rounded-xl transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h3 className="font-medium text-base leading-tight truncate">
            {workflow.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {workflow.trigger}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 -mt-1 -mr-1">
          <Switch
            checked={workflow.isActive}
            onCheckedChange={handleToggle}
            aria-label="Toggle workflow status"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Workflow Options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(workflow)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Workflow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(workflow)}
                className="text-red-500 hover:text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2 leading-none" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 min-h-[16px]" />

      <div className="mt-auto flex items-center justify-between pt-4 border-t">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {workflow.toolIds.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Wrench className="w-3.5 h-3.5" />
                {workflow.toolIds.length} action
                {workflow.toolIds.length !== 1 && "s"}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              {isIntegration ? "• Integration" : "• Custom"}
            </span>
          </div>

          <div className="flex items-center">
            {uniqueApps.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {uniqueApps.slice(0, 5).map((app, i) => (
                  <Avatar
                    key={app.slug + i}
                    className="w-5 h-5 rounded-md border text-[10px] bg-white"
                  >
                    <AvatarImage
                      src={app.icon}
                      alt={app.name || "App"}
                      className="object-cover p-px"
                    />
                    <AvatarFallback className="rounded-md">
                      {app.name ? app.name.charAt(0) : "A"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {uniqueApps.length > 5 && (
                  <div className="w-5 h-5 rounded-md border bg-muted flex items-center justify-center text-[8px] text-muted-foreground font-medium">
                    +{uniqueApps.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {assignedAgents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                className="overflow-hidden h-6 w-6 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 border-2 border-background"
                style={{
                  backgroundColor: agent.customization.primaryColor,
                }}
              >
                {agent.customization.botIcon ? (
                  <img
                    src={agent.customization.botIcon}
                    alt={agent.customization.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[8px]">
                    {agent.customization.name.charAt(0)}
                  </span>
                )}
              </div>
            ))}
            {assignedAgents.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                +{assignedAgents.length - 3}
              </div>
            )}
          </div>

          <Popover open={agentPopoverOpen} onOpenChange={setAgentPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full ml-1"
                aria-label="Assign Agents"
              >
                <Plus className="w-3 h-3 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Assign Agents
              </p>
              <div className="mt-1 max-h-40 overflow-y-auto cursor-pointer">
                {agents && agents.length > 0 ? (
                  agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleToggleAgent(agent.id)}
                      disabled={updatingAgentId === agent.id}
                      className={`flex cursor-pointer items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors outline-none hover:bg-muted ${
                        updatingAgentId === agent.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      aria-pressed={isAgentAssigned(agent.id)}
                    >
                      <div
                        className="overflow-hidden h-5 w-5 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                        style={{
                          backgroundColor: agent.customization.primaryColor,
                        }}
                      >
                        {agent.customization.botIcon ? (
                          <img
                            src={agent.customization.botIcon}
                            alt={agent.customization.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[8px]">
                            {agent.customization.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="flex-1 text-left truncate font-medium">
                        {agent.customization.name}
                      </span>
                      {updatingAgentId === agent.id ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : isAgentAssigned(agent.id) ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : null}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground px-2 py-3 text-center">
                    No agents in this workspace
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
