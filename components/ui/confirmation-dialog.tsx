import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { X, Loader } from "lucide-react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  warningMessage?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "destructive" | "default";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  warningMessage,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "destructive",
  size = "md",
}: ConfirmationDialogProps) => {
  const titleColor =
    variant === "destructive"
      ? "text-red-600"
      : "text-gray-900 dark:text-white";
  const warningBg =
    variant === "destructive"
      ? "bg-red-50 border-red-200"
      : "bg-yellow-50 border-yellow-200";
  const warningText =
    variant === "destructive" ? "text-red-800" : "text-yellow-800";

  return (
    <Modal isOpen={isOpen} closeModal={onClose} size={size}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
        <div className="flex items-center justify-between mb-0">
          <h3 className={`text-lg font-medium ${titleColor}`}>{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-0.5 space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          {warningMessage && (
            <div className={`${warningBg} border rounded-lg p-4`}>
              <p className={`text-sm ${warningText}`}>⚠️ {warningMessage}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} variant={variant}>
            {isLoading && <Loader className="w-4 h-4 animate-spin " />}
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
