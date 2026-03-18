"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, getContrastingColor } from "@/lib/utils";
import { FormEvent, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Square, ArrowUp, Paperclip, X } from "lucide-react";
import { ChatStatus } from "ai";
import { IAgent } from "@/lib/types/agent";
import Link from "next/link";

interface ChatInputProps {
  agent: IAgent;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: ChatStatus;
  isWidget?: boolean;
  isUploading?: boolean;
  attachedImage: { file: File; previewUrl: string } | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
}

export const ChatInput = ({
  agent,
  input,
  handleSubmit,
  handleInputChange,
  status,
  isWidget = false,
  isUploading = false,
  attachedImage,
  onImageSelect,
  onImageRemove,
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = isUploading || (status !== "ready" && status !== "error");
  const canSubmit = input.trim() || attachedImage;
  const MIN_TEXTAREA_HEIGHT = 32;
  const MAX_TEXTAREA_HEIGHT = 200;

  const resizeTextarea = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT)}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLoading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
    e.target.value = "";
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
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-1 p-1">
              {attachedImage && (
                <div className="relative w-fit px-1 pt-1">
                  <img
                    src={attachedImage.previewUrl}
                    alt="Attachment"
                    className="h-16 w-16 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={onImageRemove}
                    aria-label="Remove image"
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="relative min-w-0 flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onInput={resizeTextarea}
                    onKeyDown={handleKeyDown}
                    placeholder={"Ask me anything..."}
                    wrap="soft"
                    className="!text-base w-full min-h-[32px] max-h-[200px] field-sizing-fixed resize-none overflow-x-hidden rounded-none border-0 bg-transparent p-1 pl-1.5 leading-relaxed break-words [overflow-wrap:anywhere] transition-all duration-200 focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 shadow-none md:p-2"
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

                <div className="flex-shrink-0 flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-label="Attach image"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isLoading}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach image"
                    className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Button
                      type={isLoading ? "button" : "submit"}
                      variant={isLoading ? "ghost" : "default"}
                      disabled={isLoading || !canSubmit}
                      style={{
                        backgroundColor:
                          isLoading || !canSubmit
                            ? "transparent"
                            : agent.customization.primaryColor,
                        color:
                          isLoading || !canSubmit
                            ? "black"
                            : getContrastingColor(agent.customization.primaryColor),
                      }}
                      className={clsx(
                        "md:w-10 md:h-10 w-8 h-8 rounded-full transition-colors disabled:opacity-50",
                      )}
                    >
                      {isLoading ? (
                        <Square className="md:h-10 md:w-10 h-8 w-8 animate-[spin_2s_linear_infinite] fill-black" />
                      ) : (
                        <ArrowUp className="md:h-5 md:w-5 scale-110" />
                      )}
                    </Button>
                  </motion.div>
                </div>
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
