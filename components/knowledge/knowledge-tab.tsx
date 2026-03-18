"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import FolderSidebar from "@/components/knowledge/folder-sidebar";
import KnowledgeContentList from "@/components/knowledge/knowledge-content-list";
import ContentDetailPanel, {
  ContentItem,
} from "@/components/knowledge/content-detail-panel";
import AddTextModal from "@/components/knowledge/add-text-modal";
import AddDocumentModal from "@/components/knowledge/add-document-modal";
import AddWebsiteModal from "@/components/knowledge/add-website-modal";
import { useFolders } from "@/lib/hooks/folders/use-folders";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
export default function KnowledgeTab() {
  const { wid } = useParams() as { wid: string };
  const { data: folders, isLoading } = useFolders(wid);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [websiteModalMode, setWebsiteModalMode] = useState<"add" | "scrape">(
    "scrape"
  );
  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(
    null
  );

  const { deletePdf, deleteWebsite, deleteText, deleteTeachKnowledge } =
    useKnowledgeActions();

  useEffect(() => {
    if (folders && folders.length > 0 && !selectedFolderId) {
      const miscellaneousFolder = folders.find(
        (f) => f.name === "Miscellaneous"
      );
      setSelectedFolderId(miscellaneousFolder?.id || folders[0]?.id || null);
    }
  }, [folders, selectedFolderId]);

  const handleDeleteContent = (content: ContentItem) => {
    setContentToDelete(content);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contentToDelete || !selectedFolderId) return;

    switch (contentToDelete.type) {
      case "document":
        await deletePdf.mutateAsync({
          wid,
          folderId: selectedFolderId,
          did: contentToDelete.data.id,
        });
        break;
      case "website":
        await deleteWebsite.mutateAsync({
          wid,
          folderId: selectedFolderId,
          uid: contentToDelete.data.id,
        });
        break;
      case "text":
        await deleteText.mutateAsync({
          wid,
          folderId: selectedFolderId,
          textId: contentToDelete.data.id,
        });
        break;
      case "teach":
        await deleteTeachKnowledge.mutateAsync({
          wid,
          folderId: selectedFolderId,
          tid: contentToDelete.data.id,
        });
        break;
    }

    setDeleteModalOpen(false);
    setContentToDelete(null);
    setSelectedContent(null);
  };

  const getDeleteTitle = () => {
    if (!contentToDelete) return "Delete Content";
    switch (contentToDelete.type) {
      case "document":
        return `Delete "${contentToDelete.data.docName}"?`;
      case "website":
        return `Delete "${contentToDelete.data.title}"?`;
      case "text":
        return "Delete this text content?";
      case "teach":
        return `Delete "${contentToDelete.data.title}"?`;
    }
  };

  if (isLoading) {
    return <KnowledgeTabSkeleton />;
  }

  return (
    <div className="h-full w-full relative">
      <div className="bg-card border rounded-xl h-full overflow-hidden flex relative">
        <div className="bg-secondary z-10 hidden md:flex">
          <FolderSidebar
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => {
              setSelectedFolderId(id);
              setSelectedContent(null);
            }}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {selectedFolderId ? (
            <KnowledgeContentList
              folderId={selectedFolderId}
              selectedContent={selectedContent}
              onSelectContent={setSelectedContent}
              onAddDocument={() => setIsAddDocumentModalOpen(true)}
              onAddWebsite={() => {
                setWebsiteModalMode("scrape");
                setIsAddWebsiteModalOpen(true);
              }}
              onAddUrl={() => {
                setWebsiteModalMode("add");
                setIsAddWebsiteModalOpen(true);
              }}
              onAddText={() => setIsAddTextModalOpen(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <Search className="w-8 h-8 md:w-10 md:h-10 opacity-40" />
              </div>
              <p className="text-lg md:text-xl font-medium mb-2 text-foreground text-center">
                Select a Folder
              </p>
              <p className="text-xs md:text-sm max-w-sm text-center text-muted-foreground/80">
                Choose a folder from the sidebar to view and manage its
                knowledge base content.
              </p>
            </div>
          )}
        </div>

        {selectedContent && (
          <aside className="bg-background overflow-hidden border-l w-[320px] xl:w-[380px] flex-shrink-0 hidden lg:block h-full">
            <div className="w-full h-full flex flex-col">
              <ContentDetailPanel
                content={selectedContent}
                onClose={() => setSelectedContent(null)}
                onDelete={handleDeleteContent}
              />
            </div>
          </aside>
        )}
      </div>

      {isAddDocumentModalOpen && (
        <AddDocumentModal
          isOpen={isAddDocumentModalOpen}
          onClose={() => setIsAddDocumentModalOpen(false)}
          wid={wid}
          folderId={selectedFolderId}
        />
      )}
      {isAddWebsiteModalOpen && (
        <AddWebsiteModal
          isOpen={isAddWebsiteModalOpen}
          onClose={() => setIsAddWebsiteModalOpen(false)}
          wid={wid}
          folderId={selectedFolderId}
          mode={websiteModalMode}
        />
      )}
      {isAddTextModalOpen && (
        <AddTextModal
          isOpen={isAddTextModalOpen}
          onClose={() => setIsAddTextModalOpen(false)}
          wid={wid}
          folderId={selectedFolderId}
        />
      )}

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

function KnowledgeTabSkeleton() {
  return (
    <div className="h-full w-full relative">
      <div className="bg-card border rounded-xl h-full overflow-hidden flex relative">
        {/* Sidebar Skeleton */}
        <div className="bg-secondary z-10 hidden md:flex w-[260px] lg:w-[280px] flex-col border-r">
          <div className="h-14 border-b bg-muted/10 px-4 flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="flex-1 p-2 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Content Header */}
          <div className="h-14 border-b bg-muted/10 px-4 flex items-center justify-between shrink-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 hidden md:block" />
              <Skeleton className="h-9 w-24 hidden md:block" />
              <Skeleton className="h-9 w-24 hidden md:block" />
              <Skeleton className="h-9 w-9 md:hidden" />
            </div>
          </div>
          {/* Empty content area while folders are loading */}
        </div>
      </div>
    </div>
  );
}
