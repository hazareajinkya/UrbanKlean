"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useWebKnowledge } from "@/lib/hooks/knowledge/use-knowledge-base";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { Plus, Loader2, Globe, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { capitalize, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function WebsiteTab() {
  const [url, setUrl] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<{
    id: string;
    title: string;
    url: string;
  } | null>(null);

  const { wid } = useParams() as { wid: string };
  const { data: webKnowledge, isLoading } = useWebKnowledge(wid);
  const { embedAndSaveWebsite, deleteWebsite } = useKnowledgeActions();

  const handleAddWebsite = async () => {
    if (!url.trim()) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    await embedAndSaveWebsite.mutateAsync({ wid, url });
    setUrl(""); // Clear input after successful submission
  };

  const handleDeleteWebsite = (website: {
    id: string;
    title: string;
    url: string;
  }) => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddWebsite();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <p className="text-sm text-gray-800">Loading website content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium">Website</h4>
              <p className="text-sm text-muted-foreground">
                Add websites to scrape and include in your knowledge base
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={embedAndSaveWebsite.isPending}
                className="w-80"
              />
              <Button
                onClick={handleAddWebsite}
                disabled={!url.trim() || embedAndSaveWebsite.isPending}
                variant="outline"
              >
                {embedAndSaveWebsite.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Website
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

      {!webKnowledge?.urls || webKnowledge.urls.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Globe className="mx-auto h-8w w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No websites added yet. <br /> Add your first website to get
                started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {webKnowledge?.urls && webKnowledge.urls.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {webKnowledge.urls.map((website) => (
              <Card key={website.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 " />
                    <div>
                      <p className="font-medium">{website.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline"
                        >
                          {website.url}
                        </a>
                        <span>•</span>
                        <span>{formatDate(website.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full border border-green-200">
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
              </Card>
            ))}
          </div>
        </div>
      )}

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
