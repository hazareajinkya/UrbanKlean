"use client";

import React from "react";
import { useAIActions } from "@/lib/hooks/actions/use-ai-actions";
import { getwid } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface WorkflowActionsListProps {
  instructions: string;
}

const WorkflowActionsList = ({ instructions }: WorkflowActionsListProps) => {
  const wid = getwid();
  const { actions, isLoading } = useAIActions(wid);

  // Extract action mentions from instructions
  const extractActionMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (!mentions.includes(match[1])) {
        mentions.push(match[1]);
      }
    }

    return mentions;
  };

  // Get mentioned actions
  const mentionedSlugs = extractActionMentions(instructions);
  const mentionedActions =
    actions?.filter((action) => mentionedSlugs.includes(action.slug)) || [];

  if (isLoading || mentionedActions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-foreground mb-2">
        Actions used in this workflow:
      </p>
      <div className="flex flex-wrap gap-2">
        {mentionedActions.map((action) => (
          <Badge key={action.id} variant="secondary" className="text-xs">
            {action.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default WorkflowActionsList;
