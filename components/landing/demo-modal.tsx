"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import Modal from "@/components/ui/modal";
import { Loader } from "lucide-react";

interface DemoModalContextType {
  openDemoModal: () => void;
  closeDemoModal: () => void;
}

const DemoModalContext = createContext<DemoModalContextType | undefined>(
  undefined
);

export const useDemoModal = () => {
  const context = useContext(DemoModalContext);
  if (!context) {
    throw new Error("useDemoModal must be used within a DemoModalProvider");
  }
  return context;
};

export const DemoModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const openDemoModal = useCallback(() => {
    setIsOpen(true);
    setIsLoading(true);
  }, []);
  const closeDemoModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openDemoModal, closeDemoModal }),
    [openDemoModal, closeDemoModal]
  );

  return (
    <DemoModalContext.Provider value={value}>
      {children}
      <Modal
        isOpen={isOpen}
        closeModal={closeDemoModal}
        className="min-h-[80vh] max-w-6xl bg-white dark:bg-black rounded-2xl p-0 relative overflow-hidden"
      >
        <div className="relative w-full h-[80vh]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ22jofNUdgRK1BRtkCWZurBH-qrF8uYwlShxv8x94Gf6FsYjyDTwA86vwdTSWc6-fyEbZM2MiUX?gv=true"
            width="100%"
            className="h-full w-full"
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
      </Modal>
    </DemoModalContext.Provider>
  );
};
