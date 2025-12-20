"use client";

import { IAgent } from "@/lib/types/agent";
import { getContrastingColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StarterMessagesProps {
  agent: IAgent;
  onSelectMessage: (message: string) => void;
  disabled?: boolean;
}

export const StarterMessages = ({
  agent,
  onSelectMessage,
  disabled = false,
}: StarterMessagesProps) => {
  const { starterMessagesEnabled, starterMessages } = agent.customization;

  if (!starterMessagesEnabled || !starterMessages?.length) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2 }}
        className="px-4  absolute bottom-0.5 right-0 max-w-[70%]"
      >
        <div className="flex flex-wrap gap-2 justify-end">
          {starterMessages.map((message, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.15 }}
              onClick={() => !disabled && onSelectMessage(message)}
              disabled={disabled}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  agent.customization.primaryColor;
                e.currentTarget.style.color = getContrastingColor(
                  agent.customization.primaryColor
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.color = "";
              }}
              className="px-3 py-2 text-sm rounded-full border border-border truncate 
                         bg-background hover:border-foreground/20
                         transition-all duration-150 text-foreground/90
                         disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-[0.97] cursor-pointer hover:shadow hover:text-primary-foreground hover:bg-primary"
            >
              {message}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
