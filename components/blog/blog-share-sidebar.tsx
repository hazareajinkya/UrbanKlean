"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { ClaudeLogo, GrokLogo, OpenAIIcon, PerplexityLogo } from "@/lib/logos";

interface BlogShareSidebarProps {
  url: string;
  title: string;
  description?: string;
  content?: string;
}

const BlogShareSidebar = ({
  url,
  title,
  description,
  content,
}: BlogShareSidebarProps) => {
  const [isPageCopied, setIsPageCopied] = useState(false);
  const createAIPrompt = () => {
    return `I found an interesting blog article that I'd like you to analyze:

Title: "${title}"
${description ? `Description: "${description}"` : ""}
URL: ${url}

Please provide:
1. A concise summary
2. Main insights and takeaways
3. Your analysis and perspective
4. Any related implications or context`;
  };

  const smallPrompt = () =>
    `Create a comprehensive summary of the content at ${url} Don't expand the search for additional sources to guarantee the truthfulness of this summary.  `;

  const handleCopyPrompt = async () => {
    try {
      const prompt = createAIPrompt();
      await navigator.clipboard.writeText(prompt);
      toast.success("Prompt copied to clipboard");
    } catch {}
  };

  const handleCopyPage = async () => {
    try {
      await navigator.clipboard.writeText(content!);
      setIsPageCopied(true);
      toast.success("Page copied to clipboard");
    } catch {
      toast.error("Failed to copy page");
    }
  };

  useEffect(() => {
    if (isPageCopied) {
      const timer = setTimeout(() => {
        setIsPageCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPageCopied]);

  const handleAIShare = (
    aiName: "ChatGPT" | "Claude" | "Perplexity" | "Grok",
  ) => {
    const prompt = aiName === "Claude" ? smallPrompt() : createAIPrompt();
    const encodedPrompt = encodeURIComponent(prompt);

    const aiUrls = {
      ChatGPT: `https://chat.openai.com/?q=${encodedPrompt}`,
      Claude: `https://claude.ai/new?q=${encodedPrompt}`,
      Perplexity: `https://perplexity.ai/q=${encodedPrompt}`,
      Grok: `https://x.com/i/grok?text=${encodedPrompt}`,
    };

    try {
      window.open(aiUrls[aiName], "_blank");
    } catch {}
  };

  return (
    <div className="flex justify-end">
      <aside className="w-full lg:w-64 hidden md:block">
        <div className="flex flex-col gap-6 p-4 lg:p-0">
          <div className="flex flex-col gap-4 ">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Request an AI summary
            </h3>
            <div className="flex flex-col gap-2 text-foreground">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="w-full justify-start gap-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy page for LLM</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAIShare("ChatGPT")}
                className="w-full justify-start gap-2"
              >
                <OpenAIIcon className="size-4.5" />
                <span>ChatGPT</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAIShare("Claude")}
                className="w-full justify-start gap-2"
              >
                <ClaudeLogo className="size-4.5" />

                <span>Claude</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAIShare("Grok")}
                className="w-full justify-start gap-2"
              >
                <GrokLogo className="size-4.5" />

                <span>Grok</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAIShare("Perplexity")}
                className="w-full justify-start gap-2"
              >
                <PerplexityLogo className="size-4.5" />
                <span>Perplexity</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Copy the prompt and paste it into any LLM, or open
              ChatGPT/Claude/Grok directly.
            </p>
          </div>
        </div>
      </aside>
      <div className="mt-3 w-full md:hidden space-y-2 text-foreground w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-fit max-w-full justify-between gap-2 px-3 bg-card mx-auto"
              aria-label="Request AI summary"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="size-4" />
                <span className="text-sm font-medium whitespace-nowrap">
                  Request AI summary
                </span>
              </span>
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={handleCopyPrompt}
              className="w-full justify-start gap-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy prompt for LLM</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAIShare("ChatGPT")}
              className="w-full justify-start gap-2 "
            >
              <OpenAIIcon className="size-4.5" />
              <span>ChatGPT</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAIShare("Claude")}
              className="w-full justify-start gap-2 "
            >
              <ClaudeLogo className="size-4.5" />
              <span>Claude</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAIShare("Grok")}
              className="w-full justify-start gap-2 "
            >
              <GrokLogo className="size-4.5" />
              <span>Grok</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAIShare("Perplexity")}
              className="w-full justify-start gap-2 "
            >
              <PerplexityLogo className="size-4.5" />
              <span>Perplexity</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default BlogShareSidebar;
