"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  FileText,
  Globe,
  Type,
  BookMarkedIcon,
  Trash2,
  ExternalLink,
  Calendar,
  HardDrive,
} from "lucide-react";
import { capitalize, formatDate } from "@/lib/utils";
import { PDFIcon } from "@/lib/logos";
import {
  IDocKnowledge,
  IWebKnowledge,
  ITextKnowledge,
  ITeachKnowledge,
} from "@/lib/types/knowledge";

export type ContentItem =
  | { type: "document"; data: IDocKnowledge }
  | { type: "website"; data: IWebKnowledge }
  | { type: "text"; data: ITextKnowledge }
  | { type: "teach"; data: ITeachKnowledge };

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

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getIcon = () => {
    switch (content.type) {
      case "document":
        return <PDFIcon className="w-8 h-8" />;
      case "website":
        return <Globe className="w-8 h-8 text-blue-500" />;
      case "text":
        return <Type className="w-8 h-8 text-green-500" />;
      case "teach":
        return <BookMarkedIcon className="w-8 h-8 text-purple-500" />;
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
          content.data.content.substring(0, 50) +
          (content.data.content.length > 50 ? "..." : "")
        );
      case "teach":
        return content.data.title;
    }
  };

  const getTypeBadge = () => {
    switch (content.type) {
      case "document":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Document
          </Badge>
        );
      case "website":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            Website
          </Badge>
        );
      case "text":
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            Text
          </Badge>
        );
      case "teach":
        return (
          <Badge
            variant="outline"
            className="text-purple-500 border-purple-500"
          >
            Learned
          </Badge>
        );
    }
  };

  const renderDetails = () => {
    switch (content.type) {
      case "document":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                File Name
              </h4>
              <p className="text-sm">{content.data.docName}</p>
            </div>
            {content.data.metadata?.size && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="w-4 h-4" />
                <span>{formatFileSize(content.data.metadata.size)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDate(content.data.updatedAt)}</span>
            </div>
          </div>
        );
      case "website":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Title
              </h4>
              <p className="text-sm">{content.data.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                URL
              </h4>
              <a
                href={content.data.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {content.data.baseUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDate(content.data.updatedAt)}</span>
            </div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Content
              </h4>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md max-h-[300px] overflow-y-auto">
                {content.data.content}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDate(content.data.updatedAt)}</span>
            </div>
          </div>
        );
      case "teach":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Title
              </h4>
              <p className="text-sm">{content.data.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Content
              </h4>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md max-h-[300px] overflow-y-auto">
                {content.data.content}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDate(content.data.updatedAt)}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-[350px] border-l bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-medium">Content Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Icon and Title */}
          <div className="flex items-start gap-3">
            <div className="shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold line-clamp-2">
                {getTitle()}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {getTypeBadge()}
                <Badge variant="outline">
                  {capitalize(content.data.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details */}
          {renderDetails()}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete(content)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
