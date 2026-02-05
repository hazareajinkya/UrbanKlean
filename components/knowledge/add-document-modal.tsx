"use client";

import { useState } from "react";
import { Loader, Plus, Upload, UploadCloud, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import { formatFileSize } from "@/lib/utils";
import { toast } from "sonner";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  folderId: string | null;
}

export default function AddDocumentModal({
  isOpen,
  onClose,
  wid,
  folderId,
}: AddDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { embedAndSavePdf } = useKnowledgeActions();

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") setSelectedFile(file);
      else toast.error("Please upload only PDF files");
      e.target.value = "";
    }
  };

  const handleUploadPdf = async () => {
    if (!selectedFile || !folderId) return;
    await embedAndSavePdf.mutateAsync({
      wid,
      folderId,
      file: selectedFile,
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} closeModal={handleClose}>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-1 border-b">
          <h3 className="text-lg">Add Document</h3>
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
                  {formatFileSize(selectedFile.size)}
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
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadPdf}
            disabled={!selectedFile || !folderId || embedAndSavePdf.isPending}
            className="rounded-full"
          >
            {embedAndSavePdf.isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Document
          </Button>
        </div>
      </div>
    </Modal>
  );
}
