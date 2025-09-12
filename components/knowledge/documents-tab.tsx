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

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <p className="text-sm text-gray-800">Loading documents...</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium">Documents</h4>
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

      {!pdfKnowledge?.files || pdfKnowledge.files.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              {/* <FileText className="" /> */}
              <PDFIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No documents uploaded yet. <br /> Upload your first PDF to get
                started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {pdfKnowledge?.files && pdfKnowledge.files.length > 0 && (
        <div className="space-y-4">
          {/* <h3 className="text-lg font-medium">Uploaded Documents</h3> */}
          <div className="space-y-3">
            {pdfKnowledge.files.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* <FileText className="h-8 w-8 text-red-600" /> */}
                    <PDFIcon className="w-8 h-8" />
                    <div>
                      <p className="font-medium">{file.docName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {file.metadata?.size && (
                          <>
                            <span>{formatFileSize(file.metadata.size)}</span>
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
