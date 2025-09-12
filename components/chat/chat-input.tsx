"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, getContrastingColor } from "@/lib/utils";
import { FormEvent } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Square, ArrowUp, Send } from "lucide-react";
import { ChatRequestOptions, ChatStatus } from "ai";
import { IAgent } from "@/lib/types/agent";

interface ChatInputProps {
  agent: IAgent;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: FormEvent<HTMLFormElement>,
    options: ChatRequestOptions
  ) => void;
  status: ChatStatus;
}

export const ChatInput = ({
  agent,
  input,
  handleSubmit,
  handleInputChange,
  status,
}: ChatInputProps) => {
  const isLoading = status !== "ready" && status !== "error";
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e, {});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLoading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  return (
    <div className="p-2 pt-3 ">
      <div className="w-full mx-auto">
        <div className="flex items-end gap-3">
          <div
            className={cn(
              `flex-1 border-1 relative rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:border-color-[${agent.customization.primaryColor}]`
            )}
            style={
              {
                "--tw-ring-color": agent.customization.primaryColor,
              } as React.CSSProperties & { "--tw-ring-color": string }
            }
          >
            <form
              onSubmit={handleFormSubmit}
              className="flex items-end gap-2 p-2"
            >
              {/* Textarea */}
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={"Type your message here..."}
                  className="w-full min-h-[32px] max-h-[200px] resize-none rounded-2xl border-0 bg-transparent text-base leading-relaxed transition-all duration-200 focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 shadow-none"
                  rows={1}
                />
              </div>

              {/* Send/Stop Button */}
              <div className="flex-shrink-0 ">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    type={isLoading ? "button" : "submit"}
                    size="icon"
                    variant={isLoading ? "ghost" : "default"}
                    onClick={isLoading ? () => {} : undefined}
                    disabled={isLoading || !input.trim()}
                    style={{
                      backgroundColor:
                        isLoading || !input.trim()
                          ? "transparent"
                          : agent.customization.primaryColor,
                      color:
                        isLoading || !input.trim()
                          ? "black"
                          : getContrastingColor(
                              agent.customization.primaryColor
                            ),
                    }}
                    className={clsx(
                      "w-10 h-10 rounded-full transition-colors disabled:opacity-50"
                    )}
                  >
                    {isLoading ? (
                      <Square className="h-10 w-10 animate-[spin_2s_linear_infinite] fill-black" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
