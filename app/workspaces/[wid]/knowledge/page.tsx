"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FolderSidebar from "@/components/knowledge/folder-sidebar";
import KnowledgeContentList from "@/components/knowledge/knowledge-content-list";
import ContentDetailPanel, {
  ContentItem,
} from "@/components/knowledge/content-detail-panel";
import QATab from "@/components/knowledge/qa-tab";
import TrainTab from "@/components/knowledge/train-tab";
import { useFolders } from "@/lib/hooks/folders/use-folders";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { Book, GraduationCap, MessageSquare, FileText } from "lucide-react";
import clsx from "clsx";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Globe, X, Plus } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

type TabType = "knowledge" | "training" | "qa";

interface ScrapedUrl {
  url: string;
  title?: string;
}

export default function KnowledgeBasePage() {
  const { wid } = useParams() as { wid: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const activeTab: TabType = tabParam || "knowledge";

  const { data: folders } = useFolders(wid);
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
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [textContent, setTextContent] = useState("");

  const [scrapedUrls, setScrapedUrls] = useState<ScrapedUrl[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [websiteView, setWebsiteView] = useState<"input" | "list">("input");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(
    null
  );

  const {
    embedAndSavePdf,
    deletePdf,
    embedAndSaveWebsite,
    deleteWebsite,
    embedAndSaveText,
    deleteText,
    deleteTeachKnowledge,
    scrapeWebsite,
    crawlWebsites,
  } = useKnowledgeActions();

  useEffect(() => {
    if (
      folders &&
      folders.length > 0 &&
      !selectedFolderId &&
      activeTab === "knowledge"
    ) {
      const miscellaneousFolder = folders.find(
        (f) => f.name === "Miscellaneous"
      );
      setSelectedFolderId(miscellaneousFolder?.id || folders[0]?.id || null);
    }
  }, [folders, selectedFolderId, activeTab]);

  const handleTabChange = (tab: TabType) => {
    setSelectedContent(null);
    router.push(
      `/workspaces/${wid}/knowledge${tab === "knowledge" ? "" : `?tab=${tab}`}`
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedFolderId) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        embedAndSavePdf.mutate({ wid, folderId: selectedFolderId, file });
        setIsAddDocumentModalOpen(false);
      } else {
        toast.error("Please upload only PDF files");
      }
      e.target.value = "";
    }
  };

  const handleAddWebsite = async () => {
    if (!websiteUrl.trim() || !selectedFolderId) return;
    try {
      new URL(websiteUrl);
      await embedAndSaveWebsite.mutateAsync({
        wid,
        folderId: selectedFolderId,
        url: websiteUrl,
      });
      handleCloseWebsiteModal();
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleScrapeWebsite = async () => {
    if (!websiteUrl.trim()) return;
    try {
      new URL(websiteUrl);
      const links = await scrapeWebsite.mutateAsync({ wid, url: websiteUrl });
      if (links) {
        setScrapedUrls(links);
        setSelectedUrls(links.map((l: ScrapedUrl) => l.url));
        setWebsiteView("list");
      }
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleAddMultipleUrls = async () => {
    if (selectedUrls.length === 0 || !selectedFolderId) return;
    await crawlWebsites.mutateAsync({
      wid,
      folderId: selectedFolderId,
      baseUrl: websiteUrl,
      urls: selectedUrls,
    });
    handleCloseWebsiteModal();
  };

  const handleUrlSelection = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleSelectAllUrls = (checked: boolean) => {
    if (checked) {
      setSelectedUrls(scrapedUrls.map((link) => link.url));
    } else {
      setSelectedUrls([]);
    }
  };

  const handleCloseWebsiteModal = () => {
    setIsAddWebsiteModalOpen(false);
    setTimeout(() => {
      setWebsiteUrl("");
      setScrapedUrls([]);
      setSelectedUrls([]);
      setWebsiteView("input");
    }, 300);
  };

  const handleAddText = async () => {
    if (!textContent.trim() || !selectedFolderId) return;
    await embedAndSaveText.mutateAsync({
      wid,
      folderId: selectedFolderId,
      content: textContent,
    });
    setIsAddTextModalOpen(false);
    setTextContent("");
  };

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

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "knowledge", label: "Knowledge", icon: <Book className="w-4 h-4" /> },
    {
      id: "training",
      label: "Training",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    { id: "qa", label: "QA", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card px-6 shrink-0">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex min-h-0">
        {activeTab === "knowledge" && (
          <>
            <FolderSidebar
              selectedFolderId={selectedFolderId}
              onSelectFolder={(folderId) => {
                setSelectedFolderId(folderId);
                setSelectedContent(null);
              }}
            />
            {selectedFolderId ? (
              <>
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
                {selectedContent && (
                  <ContentDetailPanel
                    content={selectedContent}
                    onClose={() => setSelectedContent(null)}
                    onDelete={handleDeleteContent}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Select a folder to view content
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Or create a new folder to get started
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "training" && (
          <div className="flex-1 overflow-hidden">
            <TrainTab />
          </div>
        )}

        {activeTab === "qa" && (
          <div className="flex-1 overflow-hidden p-4">
            <QATab />
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddDocumentModalOpen}
        closeModal={() => setIsAddDocumentModalOpen(false)}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add Document</h3>
          <div>
            <Label htmlFor="pdf-upload">Select PDF File</Label>
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload"
              onChange={handleFileSelect}
              className="mt-2"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddWebsiteModalOpen}
        closeModal={handleCloseWebsiteModal}
      >
        <div>
          {websiteView === "input" && (
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-6">
                <h3 className="text-lg font-medium">
                  {websiteModalMode === "add"
                    ? "Add Single URL"
                    : "Scrape Website"}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseWebsiteModal}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (websiteModalMode === "add") {
                    handleAddWebsite();
                  } else {
                    handleScrapeWebsite();
                  }
                }}
              >
                <Label>Website URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={
                    embedAndSaveWebsite.isPending ||
                    scrapeWebsite.isPending ||
                    crawlWebsites.isPending
                  }
                  className="w-full mt-2"
                  required
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    onClick={handleCloseWebsiteModal}
                    variant="ghost"
                    disabled={
                      embedAndSaveWebsite.isPending ||
                      scrapeWebsite.isPending ||
                      crawlWebsites.isPending
                    }
                  >
                    Cancel
                  </Button>
                  {websiteModalMode === "add" ? (
                    <Button
                      type="submit"
                      disabled={
                        !websiteUrl.trim() ||
                        embedAndSaveWebsite.isPending ||
                        scrapeWebsite.isPending
                      }
                    >
                      {embedAndSaveWebsite.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add URL
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={
                        !websiteUrl.trim() ||
                        embedAndSaveWebsite.isPending ||
                        scrapeWebsite.isPending
                      }
                    >
                      {scrapeWebsite.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Globe className="w-4 h-4 mr-2" />
                      )}
                      Scrape Website
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}

          {websiteView === "list" && (
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-medium">Scraped URLs</h4>
                <p className="text-sm text-muted-foreground">
                  Showing results for:{" "}
                  <span className="font-semibold text-primary">
                    {websiteUrl}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {scrapedUrls.length} URLs. {selectedUrls.length}{" "}
                  selected.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-modal"
                    checked={
                      selectedUrls.length === scrapedUrls.length &&
                      scrapedUrls.length > 0
                    }
                    onCheckedChange={handleSelectAllUrls}
                  />
                  <label
                    htmlFor="select-all-modal"
                    className="text-sm font-medium"
                  >
                    Select All
                  </label>
                </div>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-1 pr-4">
                  {scrapedUrls.map((scrapedUrl, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleUrlSelection(scrapedUrl.url)}
                    >
                      <Checkbox
                        id={`modal-${scrapedUrl.url}`}
                        checked={selectedUrls.includes(scrapedUrl.url)}
                        onCheckedChange={() =>
                          handleUrlSelection(scrapedUrl.url)
                        }
                      />
                      <label
                        htmlFor={`modal-${scrapedUrl.url}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate cursor-pointer"
                        title={scrapedUrl.title || scrapedUrl.url}
                      >
                        {scrapedUrl.url || scrapedUrl.title}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => setWebsiteView("input")}
                  variant="ghost"
                  disabled={crawlWebsites.isPending}
                >
                  Back
                </Button>
                <Button
                  onClick={handleAddMultipleUrls}
                  disabled={
                    crawlWebsites.isPending || selectedUrls.length === 0
                  }
                >
                  {crawlWebsites.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Selected URLs
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isAddTextModalOpen}
        closeModal={() => {
          setIsAddTextModalOpen(false);
          setTextContent("");
        }}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add Text</h3>
          <div>
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text content..."
              rows={6}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddTextModalOpen(false);
                setTextContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddText}
              disabled={!textContent.trim() || embedAndSaveText.isPending}
            >
              {embedAndSaveText.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Add Text
            </Button>
          </div>
        </div>
      </Modal>

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
