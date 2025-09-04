"use client";

import { useState } from "react";
import { useAgents } from "@/lib/hooks/agent/use-agent";
import { useAgentActions } from "@/lib/hooks/agent/use-agent-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDate } from "@/lib/utils";
import {
  Bot,
  Plus,
  Trash2,
  Loader2,
  X,
  MessageCircle,
  Palette,
  Settings,
  Code,
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

  const { agents, isLoading } = useAgents();
  const { createAgent, deleteAgent } = useAgentActions();

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
        }
      );
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAgent(undefined);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex gap-4 justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium">Agents</h1>
            <p className="text-sm text-muted-foreground">
              Manage your AI agents here.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse group p-4">
              <CardContent className="px-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex gap-4 justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium">Agents</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI agents here.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>

      {agents && agents.length > 0 ? (
        <div className="space-y-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="group p-4 cursor-pointer "
              onClick={() =>
                router.push(`/workspaces/${wid}/agents/${agent.id}`)
              }
            >
              <CardContent className="px-0">
                <div className="flex items-center gap-4">
                  <div
                    className="overflow-hidden pt-2 h-12 w-12 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                    style={{
                      backgroundColor: agent.customization.primaryColor,
                    }}
                  >
                    {agent.customization.botIcon ? (
                      <img
                        src={agent.customization.botIcon}
                        alt="Bot icon"
                        className="w-11 h-11"
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
                            <MessageCircle className="w-4 h-4" />
                            Chat
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
                            <Settings className="w-4 h-4" />
                            Settings
                          </Button>
                        </Link>

                        <Link
                          href={`/workspaces/${wid}/agents/${agent.id}?tab=widget`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-muted-foreground rounded-full "
                            title="Widget"
                          >
                            <Code className="w-4 h-4" />
                            Widget
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
                            <Loader2 className="w-4 h-4 animate-spin" />
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
          <div className="text-muted-foreground mb-4">No agents found</div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" />
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

      <DeleteAgentModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteAgent}
        agent={deletingAgent}
        isLoading={deleteAgent.isPending}
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
          <h3 className="text-lg font-medium">Create New Agent</h3>
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
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Agent
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

interface DeleteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agent: IAgent | undefined;
  isLoading: boolean;
}

const DeleteAgentModal = ({
  isOpen,
  onClose,
  onConfirm,
  agent,
  isLoading,
}: DeleteAgentModalProps) => {
  if (!agent) return null;

  return (
    <Modal isOpen={isOpen} closeModal={onClose} size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-0">
          <h3 className="text-lg font-medium text-red-600">Delete Agent</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>"{agent.customization.name}"</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ⚠️ This action cannot be undone. All conversations and settings
              associated with this agent will be permanently removed.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete Agent
          </Button>
        </div>
      </div>
    </Modal>
  );
};
