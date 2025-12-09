"use client";

import { useParams } from "next/navigation";
import {
  FileText,
  Globe,
  Type,
  BookMarkedIcon,
  Plus,
  Loader2,
} from "lucide-react";
import {
  useDocumentsKnowledge,
  useWebsitesKnowledge,
  useTextsKnowledge,
  useTeachKnowledge,
} from "@/lib/hooks/knowledge/use-knowledge-base";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { capitalize, formatDate } from "@/lib/utils";
import { PDFIcon } from "@/lib/logos";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "./content-detail-panel";
import clsx from "clsx";

interface KnowledgeContentListProps {
  folderId: string;
  selectedContent: ContentItem | null;
  onSelectContent: (content: ContentItem) => void;
  onAddDocument: () => void;
  onAddWebsite: () => void;
  onAddUrl: () => void;
  onAddText: () => void;
}

interface UnifiedContentItem {
  id: string;
  type: "document" | "website" | "text" | "teach";
  title: string;
  subtitle?: string;
  status: string;
  updatedAt: Date;
  data: ContentItem;
}

export default function KnowledgeContentList({
  folderId,
  selectedContent,
  onSelectContent,
  onAddDocument,
  onAddWebsite,
  onAddUrl,
  onAddText,
}: KnowledgeContentListProps) {
  const { wid } = useParams() as { wid: string };

  const { data: documents, isLoading: documentsLoading } =
    useDocumentsKnowledge(wid, folderId);
  const { data: websites, isLoading: websitesLoading } = useWebsitesKnowledge(
    wid,
    folderId
  );
  const { data: texts, isLoading: textsLoading } = useTextsKnowledge(
    wid,
    folderId
  );
  const { data: teach, isLoading: teachLoading } = useTeachKnowledge(
    wid,
    folderId
  );

  const isLoading =
    documentsLoading || websitesLoading || textsLoading || teachLoading;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Combine all content into a unified list
  const unifiedContent: UnifiedContentItem[] = [
    ...(documents || []).map((doc) => ({
      id: doc.id,
      type: "document" as const,
      title: doc.docName,
      subtitle: doc.metadata?.size
        ? formatFileSize(doc.metadata.size)
        : undefined,
      status: doc.status,
      updatedAt: new Date(doc.updatedAt),
      data: { type: "document" as const, data: doc },
    })),
    ...(websites || []).map((website) => ({
      id: website.id,
      type: "website" as const,
      title: website.title || website.baseUrl,
      subtitle: website.baseUrl,
      status: website.status,
      updatedAt: new Date(website.updatedAt),
      data: { type: "website" as const, data: website },
    })),
    ...(texts || []).map((text) => ({
      id: text.id,
      type: "text" as const,
      title:
        text.content.substring(0, 60) + (text.content.length > 60 ? "..." : ""),
      status: text.status,
      updatedAt: new Date(text.updatedAt),
      data: { type: "text" as const, data: text },
    })),
    ...(teach || []).map((item) => ({
      id: item.id,
      type: "teach" as const,
      title: item.title,
      subtitle:
        item.content.substring(0, 40) + (item.content.length > 40 ? "..." : ""),
      status: item.status,
      updatedAt: new Date(item.updatedAt),
      data: { type: "teach" as const, data: item },
    })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const getIcon = (type: string) => {
    switch (type) {
      case "document":
        return <PDFIcon className="w-5 h-5" />;
      case "website":
        return <Globe className="w-5 h-5 text-primary" />;
      case "text":
        return <Type className="w-5 h-5 text-primary" />;
      case "teach":
        return <BookMarkedIcon className="w-5 h-5 text-primary" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "document":
        return "text-red-500 border-red-500";
      case "website":
        return "text-blue-500 border-blue-500";
      case "text":
        return "text-green-500 border-green-500";
      case "teach":
        return "text-purple-500 border-purple-500";
      default:
        return "";
    }
  };

  const isSelected = (item: UnifiedContentItem) => {
    if (!selectedContent) return false;
    return (
      selectedContent.type === item.type && selectedContent.data.id === item.id
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 border-r">
      {/* Toolbar */}
      <div className="border-b bg-card px-4 py-3 flex gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={onAddDocument}>
          <Plus className="w-4 h-4 mr-1" />
          Document
        </Button>
        <Button variant="outline" size="sm" onClick={onAddWebsite}>
          <Plus className="w-4 h-4 mr-1" />
          Website
        </Button>
        <Button variant="outline" size="sm" onClick={onAddUrl}>
          <Plus className="w-4 h-4 mr-1" />
          URL
        </Button>
        <Button variant="outline" size="sm" onClick={onAddText}>
          <Plus className="w-4 h-4 mr-1" />
          Text
        </Button>
      </div>

      {/* Content List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <ContentListSkeleton />
          ) : unifiedContent.length > 0 ? (
            <div className="space-y-2">
              {unifiedContent.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border border-transparent",
                    isSelected(item)
                      ? "bg-muted/50 border-l-primary border-l-4 rounded-l-none"
                      : "hover:bg-accent hover:border-border"
                  )}
                  onClick={() => onSelectContent(item.data)}
                >
                  <div className="shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {/* Only showing status and date for cleaner look */}
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 h-5 font-normal"
                      >
                        {capitalize(item.status)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(item.updatedAt.toISOString())}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No content yet</p>
              <p className="text-sm">
                Add documents, websites, or text to this folder
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ContentListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
