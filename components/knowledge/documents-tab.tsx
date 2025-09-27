"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { usePdfKnowledge } from "@/lib/hooks/knowledge/use-knowledge-base";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { PDFIcon } from "@/lib/logos";
import { capitalize, formatDate } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export default function DocumentsTab() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{
    id: string;
    docName: string;
  } | null>(null);

  const { wid } = useParams() as { wid: string };
  const { data: pdfKnowledge, isLoading } = usePdfKnowledge(wid);
  const { embedAndSavePdf, deletePdf } = useKnowledgeActions();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        embedAndSavePdf.mutate({ wid, file });
      } else {
        alert("Please upload only PDF files");
      }
      e.target.value = ""; // Reset input
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDeletePdf = (file: { id: string; docName: string }) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      await deletePdf.mutateAsync({ wid, did: fileToDelete.id });
      setDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  };

  return (
    <div className="space-y-4 m-4">
      <Card className="py-4 bg-card ">
        <CardHeader className="px-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-l font-mdium">Documents</h4>
              <p className="text-sm text-muted-foreground">
                Upload PDF documents to build your knowledge base
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".pdf"
                disabled={embedAndSavePdf.isPending}
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <Button
                asChild
                variant="outline"
                disabled={embedAndSavePdf.isPending}
              >
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {embedAndSavePdf.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload Document
                </label>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {embedAndSavePdf.isPending && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <PDFIcon className="w-6 h-6 animate-bounce text-blue-600" />
          <p className="text-sm text-blue-800">
            Processing document... This may take a few seconds.
          </p>
        </div>
      )}
      <Card className="py-0">
        <CardContent className="p-0">
          {isLoading ? (
            <DocumentListSkeleton />
          ) : (
            <>
              {!pdfKnowledge?.files || pdfKnowledge.files.length === 0 ? (
                <div className="text-center py-8">
                  <PDFIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No documents uploaded yet. <br /> Upload your first PDF to
                    get started.
                  </p>
                </div>
              ) : null}

              {pdfKnowledge?.files && pdfKnowledge.files.length > 0 && (
                <>
                  {pdfKnowledge.files.map((file, index) => (
                    <div
                      key={file.id}
                      className={`py-3.5 px-5 border-b ${
                        index === pdfKnowledge.files.length - 1
                          ? "border-b-0"
                          : "border-b"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <PDFIcon className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm mb-0.5">{file.docName}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              {file.metadata?.size && (
                                <>
                                  <span>
                                    {formatFileSize(file.metadata.size)}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{formatDate(file.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full border border-green-200 ">
                            {capitalize(file.status)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePdf(file)}
                            disabled={deletePdf.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Document"
        description={`Are you sure you want to delete "${fileToDelete?.docName}"?`}
        warningMessage="This action cannot be undone. The document will be permanently removed from your knowledge base."
        confirmText="Delete Document"
        cancelText="Cancel"
        isLoading={deletePdf.isPending}
        variant="destructive"
      />
    </div>
  );
}

const DocumentListSkeleton = () => {
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
