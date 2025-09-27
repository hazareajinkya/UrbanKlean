"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RefreshCw, Plus, Code, Edit, Trash2, Loader2 } from "lucide-react";
import { useAIActions } from "@/lib/hooks/actions/use-ai-actions";
import { useAiActionsActions } from "@/lib/hooks/actions/use-ai-actions-actions";
import { formatDate } from "@/lib/utils";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { AddApiActionModal } from "@/components/actions";

export default function ActionsPage() {
  const { wid } = useParams() as { wid: string };
  const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAction, setDeletingAction] = useState<any>(null);

  const { actions, isLoading } = useAIActions(wid);
  const { deleteAction } = useAiActionsActions();

  const handleDeleteAction = () => {
    if (!deletingAction) return;

    deleteAction.mutate(
      { wid, actionId: deletingAction.id },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setDeletingAction(null);
        },
      }
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl ">Actions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your custom API actions
          </p>
        </div>
        <Button
          onClick={() => setIsAddActionModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Action
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin mb-4" />
          <p className="text-muted-foreground">Loading actions...</p>
        </div>
      ) : actions && actions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="space-y-0 pt-0">
                {/* <div className="mb-4 min-w-max w-14 h-14 bg-black rounded-lg grid place-items-center text-white font-medium text-sm">
                  API
                </div> */}
                <div className="flex gap-2 items-center justify-between">
                  <div>
                    <p className="font-mediu">{action.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  {/* <div className="uppercase text-xs text-muted-foreground bg-muted px-2 rounded-sm py-0.5">
                    {action.type}
                  </div> */}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">{action.slug}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAction(action);
                        setIsAddActionModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingAction(action);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Code className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No custom actions yet. <br /> Create your first API action to get
            started.
          </p>
        </div>
      )}

      {/* Modals */}
      {isAddActionModalOpen && (
        <AddApiActionModal
          isOpen={isAddActionModalOpen}
          onClose={() => {
            setIsAddActionModalOpen(false);
            setEditingAction(null);
          }}
          wid={wid}
          editingAction={editingAction}
        />
      )}

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAction(null);
        }}
        onConfirm={handleDeleteAction}
        title="Delete Action"
        description={`Are you sure you want to delete "${deletingAction?.name}"? This action cannot be undone.`}
        isLoading={deleteAction.isPending}
      />
    </div>
  );
}
