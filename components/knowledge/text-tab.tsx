"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useTextKnowledge } from "@/lib/hooks/knowledge/use-knowledge-base";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { useParams } from "next/navigation";
import { v4 } from "uuid";
import { Save, Loader2, FileText } from "lucide-react";

export default function TextTab() {
  const [textContent, setTextContent] = useState("");

  const { wid } = useParams() as { wid: string };
  const { data: textKnowledge, isLoading } = useTextKnowledge(wid);
  const { embedAndSaveText } = useKnowledgeActions();

  const handleSaveText = async () => {
    if (!textContent.trim()) return;

    const tid = textKnowledge?.id ?? v4();

    await embedAndSaveText.mutateAsync({ wid, tid, content: textContent });
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium ">Text</h4>
              <p className="text-sm text-muted-foreground">
                Add your knowledge content as plain text
              </p>
            </div>
            <div>
              <Button
                onClick={handleSaveText}
                disabled={!textContent.trim() || embedAndSaveText.isPending}
                variant="outline"
              >
                {embedAndSaveText.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Text
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="">
        <Textarea
          id="text-content"
          placeholder="Enter your text content here..."
          className="min-h-[400px] resize-y max-h-[70vh] overflow-y-auto bg-white"
          value={textContent}
          onChange={handleTextChange}
          disabled={embedAndSaveText.isPending}
        />
      </div>
    </div>
  );
}
