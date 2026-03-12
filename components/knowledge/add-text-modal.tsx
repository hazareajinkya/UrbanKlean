"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";

interface AddTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  folderId: string | null;
}

export default function AddTextModal({
  isOpen,
  onClose,
  wid,
  folderId,
}: AddTextModalProps) {
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const { embedAndSaveText } = useKnowledgeActions();

  const handleClose = () => {
    setTextContent("");
    setTextTitle("");
    onClose();
  };

  const handleAddText = async () => {
    if (!textContent.trim() || !textTitle.trim() || !folderId) return;
    await embedAndSaveText.mutateAsync({
      wid,
      folderId,
      content: textContent,
      title: textTitle,
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      className="max-h-[75vh] overflow-y-auto bg-white dark:bg-black rounded-2xl p-6 max-w-lg"
    >
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between pb-1 border-b">
          <h3 className="text-lg">Add Text</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-title">Title</Label>
            <Input
              id="text-title"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="Enter title..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text content..."
              rows={12}
              className="min-h-[200px] max-h-[400px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddText}
            disabled={
              !textContent.trim() ||
              !textTitle.trim() ||
              !folderId ||
              embedAndSaveText.isPending
            }
            className="rounded-full"
          >
            {embedAndSaveText.isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Text
          </Button>
        </div>
      </div>
    </Modal>
  );
}
