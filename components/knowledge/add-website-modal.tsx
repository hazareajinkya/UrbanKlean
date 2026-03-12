"use client";

import { useState } from "react";
import { Globe, Loader, Plus, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { toast } from "sonner";

interface ScrapedCategory {
  folderId: string;
  folderName: string;
  urls: string[];
}

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  folderId: string | null;
  mode: "add" | "scrape";
}

export default function AddWebsiteModal({
  isOpen,
  onClose,
  wid,
  folderId,
  mode,
}: AddWebsiteModalProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedCategory[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<
    { url: string; folderId: string; folderName: string }[]
  >([]);
  const [view, setView] = useState<"input" | "list">("input");

  const { embedAndSaveWebsite, scrapeWebsite, crawlWebsites } =
    useKnowledgeActions();

  const totalUrlsCount = scrapedUrls.reduce(
    (acc, cat) => acc + cat.urls.length,
    0,
  );
  const isAllSelected =
    scrapedUrls.length > 0 && selectedUrls.length === totalUrlsCount;

  const handleClose = () => {
    setWebsiteUrl("");
    setScrapedUrls([]);
    setSelectedUrls([]);
    setView("input");
    onClose();
  };

  const handleAddWebsite = async () => {
    if (!websiteUrl.trim() || !folderId) return;
    try {
      new URL(websiteUrl);
      await embedAndSaveWebsite.mutateAsync({ wid, folderId, url: websiteUrl });
      handleClose();
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
        setSelectedUrls(
          categories.flatMap((cat: ScrapedCategory) =>
            cat.urls.map((url) => ({
              url,
              folderId: cat.folderId,
              folderName: cat.folderName,
            })),
          ),
        );
        setView("list");
      }
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleUrlSelection = (
    url: string,
    folderId: string,
    folderName: string,
  ) => {
    setSelectedUrls((prev) => {
      const exists = prev.some((u) => u.url === url && u.folderId === folderId);
      return exists
        ? prev.filter((u) => !(u.url === url && u.folderId === folderId))
        : [...prev, { url, folderId, folderName }];
    });
  };

  const handleSelectAllUrls = (checked: boolean) => {
    setSelectedUrls(
      checked
        ? scrapedUrls.flatMap((cat) =>
            cat.urls.map((url) => ({
              url,
              folderId: cat.folderId,
              folderName: cat.folderName,
            })),
          )
        : [],
    );
  };

  const handleAddMultipleUrls = async () => {
    if (selectedUrls.length === 0) return;
    try {
      await crawlWebsites.mutateAsync({ wid, urls: selectedUrls });
      handleClose();
    } catch {
      toast.error("Failed to add some URLs");
    }
  };

  const isPending =
    embedAndSaveWebsite.isPending ||
    scrapeWebsite.isPending ||
    crawlWebsites.isPending;

  return (
    <Modal isOpen={isOpen} closeModal={handleClose}>
      <div className="space-y-6 w-full">
        {view === "input" && (
          <>
            <div className="flex items-center justify-between pb-1 border-b">
              <h3 className="text-lg">
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mode === "add" ? handleAddWebsite() : handleScrapeWebsite();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
            </form>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-full"
              >
                Cancel
              </Button>
              {mode === "add" ? (
                <Button
                  onClick={handleAddWebsite}
                  disabled={!websiteUrl.trim() || isPending}
                  className="rounded-full"
                >
                  {embedAndSaveWebsite.isPending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add URL
                </Button>
              ) : (
                <Button
                  onClick={handleScrapeWebsite}
                  disabled={!websiteUrl.trim() || isPending}
                  className="rounded-full"
                >
                  {scrapeWebsite.isPending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  Scrape Website
                </Button>
              )}
            </div>
          </>
        )}

        {view === "list" && (
          <>
            <div className="flex items-center justify-between pb-1 border-b">
              <div>
                <h3 className="text-lg">Scraped URLs</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing results for:{" "}
                  <span className="font-semibold text-primary">
                    {websiteUrl}
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedUrls.length} selected.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-modal"
                    checked={isAllSelected}
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
                              u.url === url && u.folderId === category.folderId,
                          );
                          return (
                            <div
                              key={`${category.folderId}-${urlIndex}`}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                              onClick={() =>
                                handleUrlSelection(
                                  url,
                                  category.folderId,
                                  category.folderName,
                                )
                              }
                            >
                              <Checkbox
                                id={`modal-${category.folderId}-${url}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleUrlSelection(
                                    url,
                                    category.folderId,
                                    category.folderName,
                                  )
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
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setView("input")}
                variant="outline"
                disabled={crawlWebsites.isPending}
                className="rounded-full"
              >
                Back
              </Button>
              <Button
                onClick={handleAddMultipleUrls}
                disabled={crawlWebsites.isPending || selectedUrls.length === 0}
                className="rounded-full"
              >
                {crawlWebsites.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Selected URLs
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
