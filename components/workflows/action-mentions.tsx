"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAIActions } from "@/lib/hooks/actions/use-ai-actions";
import { IAction } from "@/lib/types/actions";
import { getwid } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface ActionMentionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

interface MentionState {
  isOpen: boolean;
  search: string;
  position: { top: number; left: number };
  mentionStart: number;
}

const ActionMentions = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 6,
}: ActionMentionsProps) => {
  const [mentionState, setMentionState] = useState<MentionState>({
    isOpen: false,
    search: "",
    position: { top: 0, left: 0 },
    mentionStart: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wid = getwid();
  const { actions, isLoading } = useAIActions(wid);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Filter actions based on search
  const filteredActions =
    actions?.filter(
      (action) =>
        action.name.toLowerCase().includes(mentionState.search.toLowerCase()) ||
        action.slug.toLowerCase().includes(mentionState.search.toLowerCase()),
    ) || [];

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionState.search]);

  useEffect(() => {
    if (mentionState.isOpen && itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedIndex, mentionState.isOpen]);

  // Calculate cursor position for popover placement
  const getCursorPosition = (textarea: HTMLTextAreaElement, offset: number) => {
    const textBeforeCursor = textarea.value.substring(0, offset);
    const lines = textBeforeCursor.split("\n");
    const currentLineIndex = lines.length - 1;
    const currentLineLength = lines[currentLineIndex].length;

    // Create a temporary span to measure text dimensions
    const span = document.createElement("span");
    span.style.font = window.getComputedStyle(textarea).font;
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";
    span.textContent = lines[currentLineIndex];
    document.body.appendChild(span);

    const lineWidth = span.offsetWidth;
    const lineHeight =
      parseInt(window.getComputedStyle(textarea).lineHeight) || 20;

    document.body.removeChild(span);

    const rect = textarea.getBoundingClientRect();
    const scrollTop = textarea.scrollTop;

    return {
      top:
        rect.top + currentLineIndex * lineHeight - scrollTop + lineHeight + 4,
      left: rect.left + Math.min(lineWidth, rect.width - 200), // Ensure popover doesn't overflow
    };
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    onChange(newValue);

    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([\w-]*)$/);

    if (mentionMatch && textareaRef.current) {
      const mentionStart = cursorPosition - mentionMatch[0].length;
      const search = mentionMatch[1];
      const position = getCursorPosition(textareaRef.current, mentionStart);
      setMentionState({
        isOpen: true,
        search,
        position,
        mentionStart,
      });
    } else {
      setMentionState((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const insertAction = (action: IAction) => {
    if (!textareaRef.current) return;

    const beforeMention = value.substring(0, mentionState.mentionStart);
    const afterCursor = value.substring(textareaRef.current.selectionStart);
    const newValue = beforeMention + `@${action.slug}` + afterCursor;

    onChange(newValue);
    setMentionState((prev) => ({ ...prev, isOpen: false }));

    // Set cursor position after the inserted mention
    setTimeout(() => {
      const newCursorPosition =
        mentionState.mentionStart + action.slug.length + 1;
      textareaRef.current?.setSelectionRange(
        newCursorPosition,
        newCursorPosition,
      );
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mentionState.isOpen || filteredActions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredActions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredActions.length - 1,
        );
        break;
      case "Enter":
        if (mentionState.isOpen) {
          e.preventDefault();
          insertAction(filteredActions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setMentionState((prev) => ({ ...prev, isOpen: false }));
        break;
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />

      <Popover open={mentionState.isOpen}>
        <PopoverAnchor asChild>
          <div
            style={{
              position: "fixed",
              top: mentionState.position.top,
              left: mentionState.position.left,
              width: 1,
              height: 1,
              pointerEvents: "none",
            }}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-72 p-0 z-[100]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="start"
          side="bottom"
        >
          <ScrollArea className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">
                Loading actions...
              </div>
            ) : filteredActions.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No actions found.
              </div>
            ) : (
              <div className="p-1 space-y-2">
                {filteredActions.map((action, index) => (
                  <div
                    key={action.id}
                    ref={(el) => {
                      itemsRef.current[index] = el;
                    }}
                    onClick={() => insertAction(action)}
                    className={`flex items-center gap-3 w-full px-2 py-2 rounded-md cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-0.">
                        <span className="font-medium text-sm text-gray-700">
                          {action.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ActionMentions;
