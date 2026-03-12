"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";

interface CollapsibleTabContainerProps {
  title: string;
  description: string;
  createButton?: ReactNode;
  sidebarContent: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  loaderComponent?: ReactNode;
  showLibraryButton?: boolean;
  libraryButtonText?: string;
  isLibraryOpen: boolean;
  onToggleLibrary: () => void;
}

export function CollapsibleTabContainer({
  title,
  description,
  createButton,
  sidebarContent,
  children,
  isLoading,
  loaderComponent,
  showLibraryButton = true,
  libraryButtonText = "Library",
  isLibraryOpen,
  onToggleLibrary,
}: CollapsibleTabContainerProps) {
  return (
    <div className="p-4 h-[calc(100vh-3rem)] flex justify-between gap-0 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 h-full pr-4">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            {showLibraryButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleLibrary}
                className={`flex items-center gap-2 transition-all duration-200  `}
              >
                <LayoutGrid
                  className={`w-4 h-4 ${isLibraryOpen ? "scale-110" : ""}`}
                />
                {libraryButtonText}
              </Button>
            )}
            {createButton}
          </div>
        </div>

        {isLoading ? (
          loaderComponent
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pb-4">{children}</div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isLibraryOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: 20 }}
            animate={{ width: 340, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-shrink-0 border rounded-xl bg-card/50 backdrop-blur-sm h-full overflow-hidden shadow-sm ml-4"
          >
            <div className="w-[340px] p-4 h-full">{sidebarContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
