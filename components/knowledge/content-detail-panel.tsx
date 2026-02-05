"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Globe,
  Type,
  BookMarkedIcon,
  Trash2,
  ExternalLink,
  Calendar,
  HardDrive,
  PanelRightClose,
} from "lucide-react";
import { capitalize, formatDate, formatFileSize } from "@/lib/utils";
import { PDFIcon } from "@/lib/logos";
import {
  IDocKnowledge,
  IWebKnowledge,
  ITextKnowledge,
  ITeachKnowledge,
} from "@/lib/types/knowledge";
import TextContentEditor from "@/components/knowledge/text-content-editor";

export type ContentItem =
  | { type: "document"; data: IDocKnowledge }
  | { type: "website"; data: IWebKnowledge }
  | { type: "text"; data: ITextKnowledge }
  | { type: "teach"; data: ITeachKnowledge }
  | null;

interface ContentDetailPanelProps {
  content: ContentItem | null;
  onClose: () => void;
  onDelete: (content: ContentItem) => void;
}

export default function ContentDetailPanel({
  content,
  onClose,
  onDelete,
}: ContentDetailPanelProps) {
  if (!content) return null;

  const getIcon = () => {
    switch (content.type) {
      case "document":
        return <PDFIcon className="w-6 h-6" />;
      case "website":
        return <Globe className="w-6 h-6 text-blue-500" />;
      case "text":
        return <Type className="w-6 h-6 text-green-500" />;
      case "teach":
        return <BookMarkedIcon className="w-6 h-6 text-purple-500" />;
    }
  };

  const getTitle = () => {
    switch (content.type) {
      case "document":
        return content.data.docName;
      case "website":
        return content.data.title || content.data.baseUrl;
      case "text":
        return (
          content.data.title ||
          content.data.content.substring(0, 50) +
            (content.data.content.length > 50 ? "..." : "")
        );
      case "teach":
        return content.data.title;
    }
  };

  const renderDetails = () => {
    switch (content.type) {
      case "document":
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                File Name
              </h4>
              <p className="text-sm text-foreground">{content.data.docName}</p>
            </div>
            {content.data.metadata?.size && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Size
                </h4>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span>{formatFileSize(content.data.metadata.size)}</span>
                </div>
              </div>
            )}
          </div>
        );
      case "website":
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Title
              </h4>
              <p className="text-sm text-foreground">{content.data.title}</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                URL
              </h4>
              <a
                href={content.data.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
              >
                {content.data.baseUrl}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        );
      case "text":
        return <TextContentEditor content={content.data} />;
      case "teach":
        return (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="space-y-1 shrink-0">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Title
              </h4>
              <p className="text-sm text-foreground">{content.data.title}</p>
            </div>
            <div className="space-y-1 flex-1 min-h-0 flex flex-col">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                Content
              </h4>
              <p className="flex-1 min-h-0 text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md overflow-y-auto text-xs leading-relaxed">
                {content.data.content}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    // aside wrapper managed by parent or here? ChatHistoryTab manages the 'aside' layout but InfoSidebar is just the content.
    // Let's make this the content of the aside.
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-12 md:h-14 border-b bg-muted/10 px-3 md:px-4 flex items-center justify-between shrink-0">
        <h3 className="text-xs md:text-sm font-medium">Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          {/* Use X on mobile for clarity, PanelRightClose on desktop */}
          <X className="w-4 h-4 lg:hidden" />
          <PanelRightClose className="w-4 h-4 hidden lg:block" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="p-3 md:p-4 flex flex-col gap-4 md:gap-6 min-h-0 flex-1">
          {/* Header Info */}
          <div className="flex items-start gap-3 md:gap-4 pb-4 md:pb-6 border-b shrink-0">
            <div className="shrink-0 p-1.5 md:p-2 bg-muted/30 rounded-lg">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs md:text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                {getTitle()}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                <Badge
                  variant="secondary"
                  className={
                    capitalize(content.data.status) === "Trained"
                      ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 text-[10px] md:text-xs"
                      : "bg-muted text-muted-foreground text-[10px] md:text-xs"
                  }
                >
                  {capitalize(content.data.status)}
                </Badge>
                <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  {formatDate(content.data.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {renderDetails()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 md:p-4 border-t bg-muted/5 mt-auto space-y-2">
        <Button
          variant="destructive"
          size="sm"
          className="w-full text-xs md:text-sm"
          onClick={() => onDelete(content)}
        >
          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
          Delete Knowledge
        </Button>
      </div>
    </div>
  );
}
