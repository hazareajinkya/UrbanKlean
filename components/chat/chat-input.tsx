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
    options: ChatRequestOptions
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
              `flex-1 border-1 relative rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:border-color-[${agent.customization.primaryColor}]`
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
                  placeholder={"Type your message here..."}
                  className="text-sm md:text-base p-1 pl-1.5 rounded-none md:p-2 w-full min-h-[32px] max-h-[200px] resize-none border-0 bg-transparent leading-relaxed transition-all duration-200 focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 shadow-none"
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
                      "md:w-10 md:h-10 w-8 h-8 rounded-full transition-colors disabled:opacity-50"
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
        href={"https://humanly-clear.ai"}
        target="_blank"
        className="pt-2.5 pb-2.5 text-center text-xs text-muted-foreground flex justify-center items-center gap-1"
      >
        Powered by{" "}
        {/* <img
          // src={"/temp-logo-transparent.png"}
          src={
            "https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/w%2Fe846a44e-988d-492a-ac46-629fd479ae5b%2Fagents%2F94fbefb7-df52-438c-8a86-de1ef901ff49%2Flogo?alt=media&token=7c7a28ec-362e-4a54-a64b-6adcec4a07e6"
          }
          className="w-4 h-4 mr-0.5 ml-1"
        /> */}
        <p className="font-medium text-lack"> Humanly Clear</p>
      </Link>
    </>
  );
};
