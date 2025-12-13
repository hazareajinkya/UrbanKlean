"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import FolderSidebar from "@/components/knowledge/folder-sidebar";
import KnowledgeContentList from "@/components/knowledge/knowledge-content-list";
import ContentDetailPanel, {
  ContentItem,
} from "@/components/knowledge/content-detail-panel";
import { useFolders } from "@/lib/hooks/folders/use-folders";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { Globe, Loader2, Plus, X, Search, UploadCloud } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

interface ScrapedCategory {
  folderId: string;
  folderName: string;
  urls: string[];
}

export default function KnowledgeTab() {
  const { wid } = useParams() as { wid: string };
  const { data: folders } = useFolders(wid);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [websiteModalMode, setWebsiteModalMode] = useState<"add" | "scrape">(
    "scrape"
  );
  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");

  const [scrapedUrls, setScrapedUrls] = useState<ScrapedCategory[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<
    { url: string; folderId: string }[]
  >([]);
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
    if (folders && folders.length > 0 && !selectedFolderId) {
      const miscellaneousFolder = folders.find(
        (f) => f.name === "Miscellaneous"
      );
      setSelectedFolderId(miscellaneousFolder?.id || folders[0]?.id || null);
    }
  }, [folders, selectedFolderId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        toast.error("Please upload only PDF files");
      }
      e.target.value = "";
    }
  };

  const handleUploadPdf = async () => {
    if (selectedFile && selectedFolderId) {
      await embedAndSavePdf.mutateAsync({
        wid,
        folderId: selectedFolderId,
        file: selectedFile,
      });
      setIsAddDocumentModalOpen(false);
      setSelectedFile(null);
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
      const categories = await scrapeWebsite.mutateAsync({
        wid,
        url: websiteUrl,
      });
      if (categories) {
        setScrapedUrls(categories);
        const allUrls = categories.flatMap(
          (cat: { urls: any[]; folderId: any }) =>
            cat.urls.map((url) => ({ url, folderId: cat.folderId }))
        );
        setSelectedUrls(allUrls);
        setWebsiteView("list");
      }
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleAddMultipleUrls = async () => {
    if (selectedUrls.length === 0) return;

    try {
      await crawlWebsites.mutateAsync({
        wid,
        urls: selectedUrls,
      });

      handleCloseWebsiteModal();
    } catch (error) {
      console.error("Error adding URLs:", error);
      toast.error("Failed to add some URLs");
    }
  };

  const handleUrlSelection = (url: string, folderId: string) => {
    setSelectedUrls((prev) => {
      const exists = prev.some((u) => u.url === url && u.folderId === folderId);
      if (exists) {
        return prev.filter((u) => !(u.url === url && u.folderId === folderId));
      } else {
        return [...prev, { url, folderId }];
      }
    });
  };

  const handleSelectAllUrls = (checked: boolean) => {
    if (checked) {
      const allUrls = scrapedUrls.flatMap((cat) =>
        cat.urls.map((url) => ({ url, folderId: cat.folderId }))
      );
      setSelectedUrls(allUrls);
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
    if (!textContent.trim() || !textTitle.trim() || !selectedFolderId) return;
    await embedAndSaveText.mutateAsync({
      wid,
      folderId: selectedFolderId,
      content: textContent,
      title: textTitle,
    });
    setIsAddTextModalOpen(false);
    setTextContent("");
    setTextTitle("");
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

  return (
    <div className="h-full w-full relative">
      <div className="bg-card border rounded-xl h-full overflow-hidden flex shadow-sm relative">
        <div className="bg-secondary border-r z-10 hidden md:flex">
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
          <aside className="bg-background overflow-hidden border-l w-[320px] xl:w-[380px] flex-shrink-0 hidden lg:block">
            <div className="w-full h-full">
              <ContentDetailPanel
                content={selectedContent}
                onClose={() => setSelectedContent(null)}
                onDelete={handleDeleteContent}
              />
            </div>
          </aside>
        )}
      </div>

      <Modal
        isOpen={isAddDocumentModalOpen}
        closeModal={() => {
          setIsAddDocumentModalOpen(false);
          setSelectedFile(null);
        }}
      >
        <div>
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h3 className="text-lg font-medium">Add Document</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsAddDocumentModalOpen(false);
                setSelectedFile(null);
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            <div
              onClick={() => document.getElementById("pdf-upload")?.click()}
              className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/5 transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="p-4 bg-muted/30 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="font-medium text-primary text-lg">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-lg">Click to upload PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Supported format: .pdf
                  </p>
                </div>
              )}

              <input
                type="file"
                accept=".pdf"
                id="pdf-upload"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDocumentModalOpen(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadPdf}
                disabled={!selectedFile || embedAndSavePdf.isPending}
              >
                {embedAndSavePdf.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin " />
                )}
                Upload
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Website Modal */}
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
                        <Loader2 className="w-4 h-4 animate-spin " />
                      ) : (
                        <Plus className="w-4 h-4 " />
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
                        <Loader2 className="w-4 h-4 animate-spin " />
                      ) : (
                        <Globe className="w-4 h-4 " />
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
                  {selectedUrls.length} selected.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-modal"
                    checked={
                      scrapedUrls.length > 0 &&
                      selectedUrls.length ===
                        scrapedUrls.reduce(
                          (acc, cat) => acc + cat.urls.length,
                          0
                        )
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
                <div className="space-y-4 pr-4">
                  {scrapedUrls.map((category) => (
                    <div key={category.folderId} className="space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground sticky top-0 bg-background py-1 z-10 border-b">
                        {category.folderName}
                      </h5>
                      <div className="space-y-1 pl-2">
                        {category.urls.map((url, urlIndex) => {
                          const isSelected = selectedUrls.some(
                            (u) =>
                              u.url === url && u.folderId === category.folderId
                          );
                          return (
                            <div
                              key={`${category.folderId}-${urlIndex}`}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                              onClick={() =>
                                handleUrlSelection(url, category.folderId)
                              }
                            >
                              <Checkbox
                                id={`modal-${category.folderId}-${url}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleUrlSelection(url, category.folderId)
                                }
                              />
                              <label
                                htmlFor={`modal-${category.folderId}-${url}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate cursor-pointer"
                                title={url}
                              >
                                {url}
                              </label>
                            </div>
                          );
                        })}
                      </div>
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
                    <Loader2 className="w-4 h-4 animate-spin " />
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

      {/* Add Text Modal */}
      <Modal
        isOpen={isAddTextModalOpen}
        closeModal={() => {
          setIsAddTextModalOpen(false);
          setTextContent("");
          setTextTitle("");
        }}
        className="max-h-[75vh] overflow-y-auto"
      >
        <div>
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h3 className="text-lg font-medium">Add Text</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsAddTextModalOpen(false);
                setTextContent("");
                setTextTitle("");
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-title">Title</Label>
              <Input
                id="text-title"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="Enter title..."
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="text-content">Text Content</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter text content..."
                rows={12}
                className="mt-2 min-h-[200px] max-h-[400px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddTextModalOpen(false);
                setTextContent("");
                setTextTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddText}
              disabled={
                !textContent.trim() ||
                !textTitle.trim() ||
                embedAndSaveText.isPending
              }
            >
              {embedAndSaveText.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
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
