"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
  Pencil,
  Trash2,
  Plus,
  Users,
  MoreVertical,
  Loader2,
  X,
  Bot,
} from "lucide-react";
import { IWorkflow } from "@/lib/types/workflow";
import { useAgents } from "@/lib/hooks/agent/use-agent";
import { useParams } from "next/navigation";

interface WorkspaceWorkflowCardProps {
  workflow: IWorkflow;
  onToggleStatus: (workflowId: string, isActive: boolean) => void;
  onEdit: (workflow: IWorkflow) => void;
  onDelete: (workflow: IWorkflow) => void;
  onUpdateAgents: (workflowId: string, aids: string[]) => void | Promise<void>;
  onCardClick?: (workflow: IWorkflow) => void;
}

export const WorkspaceWorkflowCard = ({
  workflow,
  onToggleStatus,
  onEdit,
  onDelete,
  onUpdateAgents,
  onCardClick,
}: WorkspaceWorkflowCardProps) => {
  const { wid } = useParams() as { wid: string };
  const { agents } = useAgents(wid);
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

  return (
    <div className="group relative flex flex-col p-5 bg-card border rounded-xl transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div
          className="space-y-1.5 flex-1 min-w-0 cursor-pointer"
          onClick={() => onCardClick?.(workflow)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCardClick?.(workflow);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${workflow.name} details`}
        >
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
              <DropdownMenuItem
                onClick={() => onEdit(workflow)}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Workflow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(workflow)}
                className="text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2 leading-none" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* <div className="flex-1 min-h-[16px]" /> */}

      <div className="mt-auto flex items-center gap-2 pt-4 min-h-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar overflow-y-hidden flex-nowrap ">
          {assignedAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-full border flex-shrink-0 h-6 leading-none"
            >
              <div
                className="overflow-hidden h-4 w-4 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                style={{ backgroundColor: agent.customization.primaryColor }}
              >
                {agent.customization.botIcon ? (
                  <img
                    src={agent.customization.botIcon}
                    alt={agent.customization.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Bot className="w-2.5 h-2.5" />
                )}
              </div>
              <span className="text-xs font-normal text-foreground truncate max-w-[64px]">
                {agent.customization.name}
              </span>
            </div>
          ))}
        </div>
        <Popover open={agentPopoverOpen} onOpenChange={setAgentPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size={assignedAgents.length === 0 ? "sm" : "icon"}
              className={`flex-shrink-0 gap-1.5 transition-colors duration-200 ${
                assignedAgents.length === 0
                  ? "h-7 rounded-full border-dashed px-3.5 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  : "h-6 w-6 rounded-full border-solid text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Assign Agents"
            >
              <Plus className="w-3 h-3 shrink-0" />
              {assignedAgents.length === 0 && (
                <span className="text-xs font-medium">Assign Agent</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Assign Agents
            </p>
            <div className="mt-1 overflow-y-auto cursor-pointer">
              {agents && agents.length > 0 ? (
                agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleToggleAgent(agent.id)}
                    disabled={updatingAgentId === agent.id}
                    className={`flex items-center gap-2 w-full px-2 py-2.5 rounded-md text-sm transition-colors outline-none hover:bg-muted cursor-pointer ${
                      updatingAgentId === agent.id ? "opacity-50 " : ""
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
                        <Bot className="w-3 h-3" />
                      )}
                    </div>
                    <span className="flex-1 text-left truncate font-medium">
                      {agent.customization.name}
                    </span>
                    {updatingAgentId === agent.id ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : isAgentAssigned(agent.id) ? (
                      <X className="w-4 h-4 text-primary" />
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
  );
};
