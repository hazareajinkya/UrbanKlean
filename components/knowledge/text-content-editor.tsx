"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { useParams } from "next/navigation";
import type { ITextKnowledge } from "@/lib/types/knowledge";

interface TextContentEditorProps {
  content: ITextKnowledge;
}

export default function TextContentEditor({ content }: TextContentEditorProps) {
  const { wid } = useParams() as { wid: string };
  const { updateText } = useKnowledgeActions();
  const [editContent, setEditContent] = useState(content.content || "");

  useEffect(() => {
    setEditContent(content.content || "");
  }, [content.id]);

  const hasChanges = editContent !== content.content;

  const handleSave = async () => {
    if (!editContent.trim()) return;
    await updateText.mutateAsync({
      wid,
      folderId: content.folderId,
      textId: content.id,
      title: content.title,
      content: editContent,
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="space-y-1 flex-1 min-h-0 flex flex-col">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
          Content
        </h4>
        <div className="flex-1 min-h-[200px] mt-1 overflow-hidden">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Enter content"
            className="w-full h-full bg-card text-sm leading-relaxed resize-none overflow-auto"
          />
        </div>
      </div>
      <div className="shrink-0 mt-2 min-h-[36px] flex items-center justify-end">
        {hasChanges && (
          <Button
            size="sm"
            className="text-xs md:text-sm"
            onClick={handleSave}
            disabled={!editContent.trim() || updateText.isPending}
          >
            {updateText.isPending && (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            )}
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
