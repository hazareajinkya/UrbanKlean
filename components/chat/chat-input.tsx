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
import Link from "next/link";

interface ChatInputProps {
  agent: IAgent;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: FormEvent<HTMLFormElement>,
    options: ChatRequestOptions,
  ) => void;
  status: ChatStatus;
  isWidget?: boolean;
}

export const ChatInput = ({
  agent,
  input,
  handleSubmit,
  handleInputChange,
  status,
  isWidget = false,
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
    <>
      <div className="px-3 pb-0 pt-3">
        <div className="flex items-end gap-3">
          <div
            className={cn(
              `flex-1 border-1 relative rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:border-color-[${agent.customization.primaryColor}]`,
            )}
            style={
              {
                "--tw-ring-color": agent.customization.primaryColor,
              } as React.CSSProperties & { "--tw-ring-color": string }
            }
          >
            <form
              onSubmit={handleFormSubmit}
              className="flex items-end gap-2 p-1 "
            >
              {/* Textarea */}
              <div className="w-full lex-1 relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={"Ask me anything..."}
                  className="!text-base p-1 pl-1.5 rounded-none md:p-2 w-full min-h-[32px] max-h-[200px] resize-none border-0 bg-transparent leading-relaxed transition-all duration-200 focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 shadow-none"
                  rows={1}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore
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
                              agent.customization.primaryColor,
                            ),
                    }}
                    className={clsx(
                      "md:w-10 md:h-10 w-8 h-8 rounded-full transition-colors disabled:opacity-50",
                    )}
                  >
                    {isLoading ? (
                      <Square className="md:h-10 md:w-10 h-8 w-8 animate-[spin_2s_linear_infinite] fill-black" />
                    ) : (
                      <ArrowUp className="md:h-5 md:w-5 scale-110 " />
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Link
        href={"/"}
        target="_blank"
        className="pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground flex justify-center items-center gap-1"
      >
        Powered by <p className="font-medium "> Magical CX</p>
      </Link>
    </>
  );
};
