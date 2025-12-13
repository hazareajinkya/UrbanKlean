"use client";

import React, { useState } from "react";

import { useParams } from "next/navigation";
import {
  FileText,
  Globe,
  Type,
  BookMarkedIcon,
  Plus,
  Trash2,
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
import { ContentItem } from "./content-detail-panel";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

interface KnowledgeContentListProps {
  folderId: string;
  selectedContent: ContentItem | null;
  onSelectContent: (content: ContentItem | null) => void;
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

  const { deletePdf, deleteWebsite, deleteText, deleteTeachKnowledge } =
    useKnowledgeActions();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] =
    useState<UnifiedContentItem | null>(null);

  const handleDelete = (e: React.MouseEvent, item: UnifiedContentItem) => {
    e.stopPropagation();
    setContentToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!contentToDelete) return;

    const onSuccess = () => {
      setDeleteModalOpen(false);
      setContentToDelete(null);
    };

    switch (contentToDelete.type) {
      case "document":
        deletePdf.mutate(
          { wid, folderId, did: contentToDelete.id },
          { onSuccess }
        );
        break;
      case "website":
        deleteWebsite.mutate(
          { wid, folderId, uid: contentToDelete.id },
          { onSuccess }
        );
        break;
      case "text":
        deleteText.mutate(
          { wid, folderId, textId: contentToDelete.id },
          { onSuccess }
        );
        break;
      case "teach":
        deleteTeachKnowledge.mutate(
          { wid, folderId, tid: contentToDelete.id },
          { onSuccess }
        );
        break;
    }
    onSelectContent(null);
  };

  const getDeleteTitle = () => {
    if (!contentToDelete) return "Are you sure you want to delete this item?";
    return `Are you sure you want to delete "${contentToDelete.title}"?`;
  };

  const isLoading =
    documentsLoading || websitesLoading || textsLoading || teachLoading;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
        text.title ||
        text.content.substring(0, 60) + (text.content.length > 60 ? "..." : ""),
      subtitle:
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
        return <Globe className="w-5 h-5 text-blue-500" />;
      case "text":
        return <Type className="w-5 h-5 text-green-500" />;
      case "teach":
        return <BookMarkedIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const isSelected = (item: UnifiedContentItem) => {
    if (!selectedContent) return false;
    return (
      selectedContent.type === item.type && selectedContent.data.id === item.id
    );
  };

  return (
    <div className="flex-1 flex flex-col  h-full overflow-hidden">
      {/* Header */}
      <div className="h-12 md:h-14 border-b bg-muted px-3 md:px-4 flex justify-between items-center shrink-0">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs md:text-sm font-medium text-foreground mb-0.5 truncate">
            Knowledge Assets
          </h4>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">
            {unifiedContent.length} items in this folder
          </p>
        </div>

        {/* Mobile: Dropdown menu */}
        <div className="md:hidden shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddDocument}>
                <PDFIcon className="w-4 h-4 mr-2" />
                Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddWebsite}>
                <Globe className="w-4 h-4 mr-2" />
                Website
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddUrl}>
                <Globe className="w-4 h-4 mr-2" />
                URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddText}>
                <Type className="w-4 h-4 mr-2" />
                Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Inline buttons */}
        <div className="hidden md:flex gap-2 shrink-0">
          <Button variant={"outline"} onClick={onAddDocument}>
            <PDFIcon className="w-4 h-4" />
            Document
          </Button>
          <Button variant={"outline"} onClick={onAddWebsite}>
            <Globe className="w-4 h-4" />
            Website
          </Button>
          <Button variant={"outline"} onClick={onAddUrl}>
            <Globe className="w-4 h-4" />
            URL
          </Button>
          <Button variant={"outline"} onClick={onAddText}>
            <Type className="w-4 h-4" />
            Text
          </Button>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3">
        {isLoading ? (
          <ContentListSkeleton />
        ) : unifiedContent.length > 0 ? (
          unifiedContent.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={clsx(
                "group flex items-start p-2.5 md:p-3 rounded-xl flexw cursor-pointer transition-all border",
                isSelected(item)
                  ? "bg-secondary border-primary/20 shadow-sm"
                  : "bg-background border-transparent hover:bg-muted/50 hover:border-border/50"
              )}
              onClick={() => onSelectContent(item.data)}
            >
              <div className="shrink-0 mt-0.5 p-1.  5 md:p-2 bg-muted/50 rounded-lg md:rounded-xl group-hover:bg-muted transition-colors">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 ml-2 md:ml-3 mr-2 overflow-hidden">
                <div className="flex items-center mb-0.5">
                  <h5
                    className={clsx(
                      "text-xs md:text-sm font-medium truncate",
                      isSelected(item)
                        ? "text-foreground"
                        : "text-foreground/90"
                    )}
                  >
                    {item.title}
                  </h5>
                </div>

                <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 md:line-clamp-2 leading-relaxed truncate">
                  {item.subtitle || "No description available"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={clsx(
                      "text-[10px] px-2 py-0 h-5 font-normal transition-colors",
                      item.status === "trained"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : item.status === "training"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {capitalize(item.status)}
                  </Badge>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground shrink-0 hidden sm:block">
                    {formatDate(item.updatedAt.toISOString())}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => handleDelete(e, item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3 md:mb-4">
              <FileText className="w-6 h-6 md:w-8 md:h-8 opacity-50" />
            </div>
            <p className="text-base md:text-lg font-medium mb-2 text-center">
              No knowledge yet
            </p>
            <p className="text-xs md:text-sm max-w-xs text-center mb-4 md:mb-6">
              This folder is empty. Add different types of knowledge to train
              your agent.
            </p>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setContentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Content"
        description={getDeleteTitle()}
        warningMessage="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={
          deletePdf.isPending ||
          deleteWebsite.isPending ||
          deleteText.isPending ||
          deleteTeachKnowledge.isPending
        }
        variant="destructive"
      />
    </div>
  );
}

function ContentListSkeleton() {
  return (
    <div className="space-y-2 md:space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/5"
        >
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 md:h-4 w-1/3" />
            <Skeleton className="h-2.5 md:h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
