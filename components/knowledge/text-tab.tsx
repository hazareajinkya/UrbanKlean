"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useTextKnowledge } from "@/lib/hooks/knowledge/use-knowledge-base";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { useParams } from "next/navigation";
import { v4 } from "uuid";

export default function TextTab() {
  const [textContent, setTextContent] = useState("");

  const { wid } = useParams() as { wid: string };
  const { data: textKnowledge } = useTextKnowledge(wid);
  const { embedAndSaveText } = useKnowledgeActions();

  const handleSaveText = () => {
    if (!textContent.trim()) return;

    const tid = textKnowledge?.id ?? v4();

    embedAndSaveText.mutate({ wid, tid, content: textContent });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(event.target.value);
  };

  useEffect(() => {
    if (textKnowledge) {
      setTextContent(textKnowledge.content);
    }
  }, [textKnowledge]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="text-content" className="text-sm font-medium">
              Add text content to your knowledge base
            </label>
            <Textarea
              id="text-content"
              placeholder="Enter your text content here..."
              className="min-h-[400px] resize-y"
              value={textContent}
              onChange={handleTextChange}
            />
          </div>
          {textKnowledge?.content && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Current Knowledge Base Content
              </label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  {textKnowledge.chunkSize} chunks indexed
                </p>
                <p className="text-sm mt-1 line-clamp-3">
                  {textKnowledge.content.substring(0, 200)}...
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveText}
              disabled={!textContent.trim() || embedAndSaveText.isPending}
            >
              {embedAndSaveText.isPending ? "Saving..." : "Save Text"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
