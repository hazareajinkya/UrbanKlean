"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Check, Copy, Download, Loader, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Modal from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  HumanizeSettings,
  HumanizeStyle,
} from "@/app/api/free-tools/humanize-text/schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STYLES: { value: HumanizeStyle; label: string }[] = [
  { value: "general", label: "General" },
  { value: "academic", label: "Academic" },
  { value: "blog", label: "Blog" },
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
  { value: "friendly", label: "Friendly" },
  { value: "engaging", label: "Engaging" },
];

const DEFAULT_SETTINGS: HumanizeSettings = {
  removeHiddenUnicode: true,
  transformSmartQuotes: true,
  normalizeDash: true,
  normalizeEllipsis: true,
  keyboardCharactersOnly: true,
  removePersistentWhitespace: true,
  preserveHeadings: true,
};

const MAX_WORDS = 1000;

const countWords = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const truncateToMaxWords = (value: string) => {
  const words = value.trim().split(/\s+/);
  if (words.length <= MAX_WORDS) return value;
  return words.slice(0, MAX_WORDS).join(" ");
};

const normalizeWord = (value: string) =>
  value.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

const getChangedOutputWordIndexes = (input: string, output: string) => {
  const inputWords = input.split(/\s+/).map(normalizeWord).filter(Boolean);
  const outputWords = output.split(/\s+/).map(normalizeWord).filter(Boolean);
  const n = inputWords.length;
  const m = outputWords.length;
  if (!n || !m) return new Set<number>(Array.from({ length: m }, (_, i) => i));
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] =
        inputWords[i] === outputWords[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const kept = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (inputWords[i] === outputWords[j]) {
      kept.add(j);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return new Set<number>(
    Array.from({ length: m }, (_, index) => index).filter(
      (index) => !kept.has(index),
    ),
  );
};

const OutputWithHighlights = ({
  inputText,
  outputText,
  isStreaming,
}: {
  inputText: string;
  outputText: string;
  isStreaming: boolean;
}) => {
  if (!outputText.trim()) {
    return (
      <div className="min-h-[380px] max-h-[500px] overflow-y-auto rounded-2xl border border-border/50 bg-background p-3 text-base leading-8 text-muted-foreground">
        Humanized text will appear here
      </div>
    );
  }

  if (isStreaming) {
    return (
      <div className="min-h-[380px] max-h-[500px] overflow-y-auto rounded-2xl border border-border/50 bg-background p-3 text-base leading-8 whitespace-pre-wrap break-words">
        {outputText}
      </div>
    );
  }

  const changedIndexes = getChangedOutputWordIndexes(inputText, outputText);
  const tokens = outputText.split(/(\s+)/);
  let outputWordIndex = -1;

  return (
    <div className="min-h-[380px] max-h-[500px] overflow-y-auto rounded-2xl border border-border/50 bg-background p-3 text-base leading-8 whitespace-pre-wrap break-words">
      {tokens.map((token, index) => {
        if (!token) return null;
        if (/^\s+$/u.test(token))
          return <span key={`space-${index}`}>{token}</span>;
        outputWordIndex += 1;
        return (
          <span
            key={`word-${index}`}
            className={cn(
              changedIndexes.has(outputWordIndex) &&
                "bg-emerald-100 dark:bg-emerald-900/40 rounded-sm px-0.5",
            )}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
};

export const AiHumanizer = () => {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<HumanizeStyle>("general");
  const [settings, setSettings] = useState<HumanizeSettings>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { completion, complete, isLoading, setCompletion } = useCompletion({
    api: "/api/free-tools/humanize-text",
    streamProtocol: "text",
    onError: (err) =>
      setError(err.message || "Failed to humanize text. Please try again."),
  });

  const wordCount = countWords(text);
  const isOverLimit = wordCount > MAX_WORDS;

  const handleHumanize = async () => {
    if (text.trim().length < 20) {
      setError("Please enter at least 20 characters");
      return;
    }
    if (isOverLimit) {
      setError(`Maximum ${MAX_WORDS} words allowed`);
      return;
    }
    setError(null);
    setCompletion("");
    try {
      await complete(text.trim(), {
        body: { mode: "super-ultra", style, settings },
      });
      toast.success("Text humanized successfully!");
    } catch {
      // Error handled by onError
    }
  };

  const handleCopy = async () => {
    if (!completion?.trim()) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!completion?.trim()) return;
    const blob = new Blob([completion], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "humanized-output.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleSettingChange = (key: keyof HumanizeSettings, value: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif tracking-tight">
          Humanize AI Text with MagicalCX
        </h1>
        <p className="mx-auto max-w-5xl leading-relaxed text-muted-foreground">
          Paste your AI-generated text into the editor below to instantly make
          it sound 100% human and pass all AI detectors
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-card/50 backdrop-blur-sm border rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={style}
            onValueChange={(value) => setStyle(value as HumanizeStyle)}
          >
            <SelectTrigger className="h-9 min-w-44 rounded-lg text-sm">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-lg text-sm gap-2"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Settings
          </Button>
          <Modal
            isOpen={isSettingsOpen}
            closeModal={() => setIsSettingsOpen(false)}
            className="max-w-xl bg-card border border-border rounded-2xl p-6 relative"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 rounded-lg"
              onClick={() => setIsSettingsOpen(false)}
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground pr-10">
                  Text Cleaning Options
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select which cleaning operations to apply when humanizing
                  text.
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  [
                    "removeHiddenUnicode",
                    "Remove Hidden Unicode",
                    "Removes invisible characters (zero-width spaces, soft hyphens, etc.)",
                  ],
                  [
                    "transformSmartQuotes",
                    "Transform Smart Quotes",
                    "Converts smart quotes to plain quotes.",
                  ],
                  [
                    "normalizeDash",
                    "Normalize Em-dash & En-dash",
                    "Converts long dashes to regular hyphens.",
                  ],
                  [
                    "normalizeEllipsis",
                    "Normalize Ellipsis",
                    "Converts ellipsis to three dots.",
                  ],
                  [
                    "keyboardCharactersOnly",
                    "Keyboard Characters Only",
                    "Removes unusual symbols not on standard keyboards.",
                  ],
                  [
                    "removePersistentWhitespace",
                    "Remove Persistent Whitespace",
                    "Removes extra spaces and excessive line breaks.",
                  ],
                  [
                    "preserveHeadings",
                    "Preserve Headings",
                    "Do not humanize headings/titles in super-lite mode.",
                  ],
                ].map(([key, title, desc]) => {
                  const settingKey = key as keyof HumanizeSettings;
                  return (
                    <label
                      key={key}
                      className="flex items-start justify-between gap-4 rounded-xl border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={settings[settingKey]}
                        onCheckedChange={(checked) =>
                          handleSettingChange(settingKey, checked)
                        }
                        aria-label={title}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </Modal>
        </div>

        <Button
          type="button"
          onClick={handleHumanize}
          disabled={isLoading || text.trim().length < 20 || isOverLimit}
          size="lg"
          className="h-12 rounded-xl text-base font-medium px-8"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Humanizing...
            </>
          ) : completion ? (
            "Humanize Again"
          ) : (
            "Humanize"
          )}
        </Button>
      </div>

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-sm border rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Input Text</p>
            <p
              className={cn(
                "text-xs",
                isOverLimit
                  ? "text-destructive font-medium"
                  : "text-muted-foreground",
              )}
            >
              {wordCount}/{MAX_WORDS} words
            </p>
          </div>
          <Textarea
            value={text}
            onChange={(event) => {
              const next = truncateToMaxWords(event.target.value);
              setText(next);
              setError(null);
            }}
            placeholder="Paste your AI-generated text here..."
            className="min-h-[380px] max-h-[500px] resize-none rounded-2xl !text-base !leading-8 bg-background border-border/50 p-3 focus:border-primary/30 transition-all"
          />
        </div>

        <div className="bg-card/50 backdrop-blur-sm border rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Humanized Output</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {countWords(completion || "")} words
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-lg"
                onClick={handleCopy}
                disabled={!completion?.trim()}
                aria-label="Copy output"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-lg"
                onClick={handleDownload}
                disabled={!completion?.trim()}
                aria-label="Download output"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <OutputWithHighlights
            inputText={text}
            outputText={completion || ""}
            isStreaming={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-sm font-medium mt-6">
          {error}
        </div>
      )}
    </div>
  );
};
