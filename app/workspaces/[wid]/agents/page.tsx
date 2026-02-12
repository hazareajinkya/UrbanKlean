"use client";

import { useState } from "react";
import { useAgents } from "@/lib/hooks/agent/use-agent";
import { useAgentActions } from "@/lib/hooks/agent/use-agent-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDate, copyShareUrl } from "@/lib/utils";
import {
  Bot,
  Plus,
  Trash2,
  Loader,
  X,
  MessageCircle,
  Palette,
  Settings,
  Code,
  Waves,
  MessagesSquare,
  PlayIcon,
  Settings2,
  Forward,
} from "lucide-react";
import { IAgent } from "@/lib/types/agent";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function AgentsPage() {
  const { wid } = useParams() as { wid: string };

  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [agentName, setAgentName] = useState("");
  const [deletingAgent, setDeletingAgent] = useState<IAgent>();

  const { agents, isLoading } = useAgents(wid);
  const { createAgent, deleteAgent } = useAgentActions(wid);

  const handleCreateAgent = () => {
    if (!agentName.trim()) return;

    createAgent.mutate(agentName.trim(), {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setAgentName("");
      },
    });
  };

  const handleDeleteAgent = (agent: IAgent) => {
    setDeletingAgent(agent);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAgent = () => {
    if (deletingAgent) {
      deleteAgent.mutate(
        { aid: deletingAgent.id },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            setDeletingAgent(undefined);
          },
        },
      );
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAgent(undefined);
  };

  return (
    <div className="p-4 ">
      <div className="flex gap-4 items-center justify-between mb-6">
        <div>
          <h1 className="text-xl ">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            Conversational AI agents for your business.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>

      {isLoading ? (
        <AgentListSkeleton />
      ) : agents && agents.length > 0 ? (
        <div className="space-y-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="group p-4 cursor-pointer animate-in fade-in duration-200"
              onClick={() =>
                router.push(`/workspaces/${wid}/agents/${agent.id}`)
              }
            >
              <CardContent className="px-0">
                <div className="flex items-center gap-4">
                  <div
                    className="overflow-hidden h-12 w-12 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                    style={{
                      backgroundColor: agent.customization.primaryColor,
                    }}
                  >
                    {agent.customization.botIcon ? (
                      <img
                        src={agent.customization.botIcon}
                        alt="Bot icon"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Bot className="w-8 h-8" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-base truncate">
                          {agent.customization.name}
                        </h3>
                        <p className="text-sm text-muted-foreground ">
                          {agent.customization.greetingMessage}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/workspaces/${wid}/agents/${agent.id}?tab=chat`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-muted-foreground rounded-full "
                            title="Chat"
                          >
                            <PlayIcon className="w-4 h-4" />
                            Playground
                          </Button>
                        </Link>
                        <Link
                          href={`/workspaces/${wid}/agents/${agent.id}?tab=chat-history`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-muted-foreground rounded-full"
                            title="History"
                          >
                            <MessagesSquare className="w-4 h-4" />
                            History
                          </Button>
                        </Link>

                        <Link
                          href={`/workspaces/${wid}/agents/${agent.id}?tab=appearance`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-muted-foreground rounded-full"
                            title="Appearance"
                          >
                            <Palette className="w-4 h-4" />
                            Appearance
                          </Button>
                        </Link>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-muted-foreground rounded-full"
                          title="Share"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const ok = await copyShareUrl(agent.id);
                            if (ok) router.push(`/share/${agent.id}`);
                          }}
                        >
                          <Forward className="w-4 h-4" />
                          Share
                        </Button>

                        <Link
                          href={`/workspaces/${wid}/agents/${agent.id}?tab=settings`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-muted-foreground rounded-full"
                            title="Settings"
                          >
                            <Settings2 className="w-4 h-4" />
                            Settings
                          </Button>
                        </Link>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent);
                          }}
                          className="h-8 w-8 p-0 flex-shrink-0 ml-2 hover:text-destructive"
                          disabled={deleteAgent.isPending}
                        >
                          {deleteAgent.isPending &&
                          deletingAgent?.id === agent.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 " />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 h-[60vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
            <Waves className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">
            Create your first AI agent
          </h3>
          <div className="text-muted-foreground mb-6 max-w-md">
            Your AI will use your knowledge base and actions to respond 24/7
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="lg"
            className="rounded-full"
          >
            <Plus className="w-4 h-4 " />
            Create Your First Agent
          </Button>
        </div>
      )}

      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        agentName={agentName}
        setAgentName={setAgentName}
        onSubmit={handleCreateAgent}
        isLoading={createAgent.isPending}
      />

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteAgent}
        title="Delete Agent"
        description={`Are you sure you want to delete "${deletingAgent?.customization.name}"?`}
        warningMessage="This action cannot be undone. All conversations and settings associated with this agent will be permanently removed."
        confirmText="Delete Agent"
        cancelText="Cancel"
        isLoading={deleteAgent.isPending}
        variant="destructive"
      />
    </div>
  );
}

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  setAgentName: (name: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const CreateAgentModal = ({
  isOpen,
  onClose,
  agentName,
  setAgentName,
  onSubmit,
  isLoading,
}: CreateAgentModalProps) => {
  return (
    <Modal isOpen={isOpen} closeModal={onClose} size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-0">
          <h3 className="text-lg font-medium">Create New AI Agent</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a new AI agent to help with customer support, sales, or other
          tasks.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              type="text"
              placeholder="Customer Support Bot"
              autoFocus={true}
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!agentName.trim() || isLoading}>
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              Create Agent
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const AgentListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(2)].map((_, i) => (
      <Card key={i} className="p-4 animate-pulse">
        <CardContent className="px-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/20 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="h-4 bg-primary/15 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-primary/10 rounded w-48"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-16 bg-primary/10 rounded-full"></div>
                  <div className="h-8 w-16 bg-primary/10 rounded-full"></div>
                  <div className="h-8 w-16 bg-primary/10 rounded-full"></div>
                  <div className="h-8 w-16 bg-primary/10 rounded-full"></div>
                  <div className="h-8 w-8 bg-primary/15 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
