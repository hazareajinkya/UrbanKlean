"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useWebKnowledge } from "@/lib/hooks/knowledge/use-knowledge-base";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { Plus, Loader2, Globe, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { capitalize, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Modal from "@/components/ui/modal";
import { Label } from "../ui/label";
import { IWebKnowledge } from "@/lib/types/knowledge";
import clsx from "clsx";
import { Skeleton } from "../ui/skeleton";

export default function WebsiteTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "scrape">("add");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<IWebKnowledge | null>(null);

  const { wid } = useParams() as { wid: string };
  const { data: webKnowledge, isLoading } = useWebKnowledge(wid);
  const { embedAndSaveWebsite, deleteWebsite, scrapeWebsite, crawlWebsites } =
    useKnowledgeActions();

  const handleAddUrl = async (url: string) => {
    if (!url.trim()) return;

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    await embedAndSaveWebsite.mutateAsync({ wid, url });
  };

  const handleScrapeWebsite = async (url: string) => {
    if (!url.trim()) return;
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    const links = await scrapeWebsite.mutateAsync({ wid, url });
    return links || [];
  };

  const handleAddMultipleUrls = async (baseUrl: string, urls: string[]) => {
    await crawlWebsites.mutateAsync({ wid, baseUrl, urls });
  };

  const handleDeleteWebsite = (website: IWebKnowledge) => {
    setUrlToDelete(website);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (urlToDelete) {
      await deleteWebsite.mutateAsync({ wid, uid: urlToDelete.id });
      setDeleteModalOpen(false);
      setUrlToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUrlToDelete(null);
  };

  return (
    <div className="space-y-4 m-4">
      <UrlInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUrl={handleAddUrl}
        onScrape={handleScrapeWebsite}
        isAdding={embedAndSaveWebsite.isPending || crawlWebsites.isPending}
        isScraping={scrapeWebsite.isPending}
        mode={modalMode}
        onAddMultipleUrls={handleAddMultipleUrls}
      />

      <Card className="py-4 bg-card ">
        <CardHeader className="px-4 ">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-l font-mdium">Website</h4>
              <p className="text-sm text-muted-foreground">
                Add websites to scrape and include in your knowledge base
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={"outline"}
                onClick={() => {
                  setModalMode("scrape");
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add Website
              </Button>
              <Button
                variant={"outline"}
                onClick={() => {
                  setModalMode("add");
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add URL
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {embedAndSaveWebsite.isPending && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Globe className="w-6 h-6 animate-bounce text-blue-600" />
          <p className="text-sm text-blue-800">
            Scraping website content... This may take a few seconds.
          </p>
        </div>
      )}
      <Card className="py-0 bg-card">
        {isLoading ? (
          <WebsiteListSkeleton />
        ) : (
          <CardContent className="p-0">
            {!webKnowledge || webKnowledge.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="mx-auto h-8w w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No websites added yet. <br /> Add your first website to get
                  started.
                </p>
              </div>
            ) : (
              webKnowledge.map((website, index) => (
                <div
                  key={website.id}
                  className={`py-3.5 px-5 border-b ${
                    index === webKnowledge.length - 1
                      ? "border-b-0"
                      : "border-b"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 ">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-mdium mb-0.5">
                          {website.title}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <a
                            href={website.baseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 hover:underline"
                          >
                            {website.baseUrl}
                          </a>
                          <span>•</span>
                          <span>{formatDate(website.updatedAt)}</span>
                          <span>•</span>
                          <span>{website.urls.length} urls</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={clsx(
                          "bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full border border-green-200",
                          website.status === "training" &&
                            "bg-yellow-50 text-yellow-600 text-xs px-3 py-1 rounded-full border border-yellow-200"
                        )}
                      >
                        {capitalize(website.status)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWebsite(website)}
                        disabled={deleteWebsite.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Website"
        description={`Are you sure you want to delete "${urlToDelete?.title}"?`}
        warningMessage="This action cannot be undone. The website content will be permanently removed from your knowledge base."
        confirmText="Delete Website"
        cancelText="Cancel"
        isLoading={deleteWebsite.isPending}
        variant="destructive"
      />
    </div>
  );
}

const WebsiteListSkeleton = () => {
  return (
    <div className="">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-1 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const UrlInputModal: React.FC<UrlInputModalProps> = ({
  isOpen,
  onClose,
  onAddUrl,
  onScrape,
  isAdding,
  isScraping,
  mode,
  onAddMultipleUrls,
}) => {
  const [url, setUrl] = useState("");
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedUrl[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [view, setView] = useState<"input" | "list">("input");

  const handleUrlSelection = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUrls(scrapedUrls.map((link) => link.url));
    } else {
      setSelectedUrls([]);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setUrl("");
      setScrapedUrls([]);
      setSelectedUrls([]);
      setView("input");
    }, 300); // delay to allow modal close animation
  };

  const handleAdd = async () => {
    await onAddUrl(url);
    handleClose();
  };

  const handleScrape = async () => {
    const links = await onScrape(url);
    if (links) {
      setScrapedUrls(links);
      setSelectedUrls(links.map((l) => l.url));
      setView("list");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "add") {
      handleAdd();
    } else {
      handleScrape();
    }
  };

  const handleAddSelected = async () => {
    await onAddMultipleUrls(url, selectedUrls);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} closeModal={handleClose}>
      <div className="">
        {view === "input" && (
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-6">
              <h3 className="text-lg font-medium">
                {mode === "add" ? "Add Single URL" : "Scrape Website"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <Label>Website URL</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAdding || isScraping}
                className="w-full mt-2"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="ghost"
                  disabled={isAdding || isScraping}
                >
                  Cancel
                </Button>
                {mode === "add" ? (
                  <Button
                    type="submit"
                    disabled={!url.trim() || isAdding || isScraping}
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Url
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!url.trim() || isAdding || isScraping}
                  >
                    {isScraping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    Scrape Website
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {view === "list" && (
          <div>
            <div className="mb-4">
              <h4 className="text-lg font-medium">Scraped URLs</h4>
              <p className="text-sm text-muted-foreground">
                Showing results for:{" "}
                <span className="font-semibold text-primary">{url}</span>
              </p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Found {scrapedUrls.length} URLs. {selectedUrls.length} selected.
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-modal"
                  checked={
                    selectedUrls.length === scrapedUrls.length &&
                    scrapedUrls.length > 0
                  }
                  onCheckedChange={handleSelectAll}
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
                      onCheckedChange={() => handleUrlSelection(scrapedUrl.url)}
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
                onClick={() => setView("input")}
                variant="ghost"
                disabled={isAdding}
              >
                Back
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={isAdding || selectedUrls.length === 0}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Selected URLs
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

interface ScrapedUrl {
  url: string;
  title?: string;
  description?: string;
}

interface UrlInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUrl: (url: string) => Promise<void>;
  onScrape: (url: string) => Promise<ScrapedUrl[]>;
  isAdding: boolean;
  isScraping: boolean;
  mode: "add" | "scrape";
  onAddMultipleUrls: (baseUrl: string, urls: string[]) => Promise<void>;
}
