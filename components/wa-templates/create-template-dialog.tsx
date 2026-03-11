"use client";

import { useState } from "react";
import { useWaTemplateActions } from "@/lib/hooks/whatsapp/use-wa-template-actions";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { WA_SUPPORTED_LANGUAGES } from "@/lib/data/wa-languages";
import { WATemplateCategory } from "@/lib/types/wa-api";
interface CreateTemplateDialogProps {
  wid: string;
  isOpen: boolean;
  onClose: () => void;
}

const CreateTemplateDialog = ({
  wid,
  isOpen,
  onClose,
}: CreateTemplateDialogProps) => {
  const { createTemplate } = useWaTemplateActions();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WATemplateCategory>("UTILITY");
  const [language, setLanguage] = useState("en_US");
  const [bodyText, setBodyText] = useState("");

  const [examples, setExamples] = useState<Record<string, string>>({});

  const namedMatches = Array.from(
    new Set(
      (bodyText.match(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g) || []).map((m) =>
        m.replace(/[{}]/g, ""),
      ),
    ),
  );
  const posMatches = Array.from(
    new Set(
      (bodyText.match(/\{\{(\d+)\}\}/g) || []).map((m) =>
        m.replace(/[{}]/g, ""),
      ),
    ),
  );

  const hasNamed = namedMatches.length > 0;
  const hasPos = posMatches.length > 0;

  const currentVariables = posMatches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bodyText || hasNamed) return;

    try {
      let exampleObj: any = undefined;

      if (hasPos) {
        const sortedPos = [...posMatches].sort(
          (a, b) => parseInt(a) - parseInt(b),
        );
        const exampleArray = sortedPos.map((v) => examples[v] || "example");
        exampleObj = { body_text: [exampleArray] };
      }

      const components = [
        {
          type: "BODY" as const,
          text: bodyText,
          ...(exampleObj ? { example: exampleObj } : {}),
        },
      ];

      await createTemplate.mutateAsync({
        wid,
        name: name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        category,
        language,
        components,
      });
      onClose();
    } catch (error) {}
  };

  let previewText = bodyText;
  if (!hasNamed) {
    if (hasPos) {
      posMatches.forEach((match) => {
        const val = examples[match] || `{{${match}}}`;
        previewText = previewText.replace(
          new RegExp(`\\{\\{${match}\\}\\}`, "g"),
          val,
        );
      });
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="w-full max-w-4xl bg-background border border-border shadow-lg rounded-xl p-0 overflow-hidden flex"
    >
      <div className="grid md:grid-cols-2 w-full">
        <div className="w-full  p-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="font-medium text-foreground/90 text-xl">
                Create WhatsApp Template
              </h2>
              <p className="text-muted-foreground/80 text-sm font-medium">
                Submit a new message template for Meta approval. The name must
                be lowercase with underscores.
              </p>
            </div>
            <div className="grid gap-5 py-6">
              <div className="grid gap-2">
                <Label
                  htmlFor="name"
                  className="text-foreground/80 font-medium"
                >
                  Template Name
                </Label>
                <Input
                  id="name"
                  placeholder="order_confirmation_v1"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                    )
                  }
                  className="transition-colors focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="category"
                    className="text-foreground/80 font-medium"
                  >
                    Category
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(val: WATemplateCategory) =>
                      setCategory(val)
                    }
                  >
                    <SelectTrigger
                      id="category"
                      className="transition-colors focus-visible:ring-primary/20"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="UTILITY">Utility</SelectItem>
                      <SelectItem value="AUTHENTICATION">
                        Authentication
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="language"
                    className="text-foreground/80 font-medium"
                  >
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger
                      id="language"
                      className="transition-colors focus-visible:ring-primary/20"
                    >
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {WA_SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="body"
                  className="text-foreground/80 font-medium"
                >
                  Message Body
                </Label>
                <Textarea
                  id="body"
                  placeholder="Hi {{1}}, your order {{2}} has been confirmed."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="min-h-[120px] resize-none transition-colors focus-visible:ring-primary/20"
                  required
                />
                <p className="text-[13px] text-muted-foreground/80 font-medium mt-1">
                  You can use positional variables like {"{{1}}"}, {"{{2}}"}.
                  Named variables are not allowed.
                </p>
                {hasNamed && (
                  <p className="text-[13px] text-destructive font-medium mt-1">
                    Named variables like {"{{first_name}}"} are not supported.
                    Please use positional variables like {"{{1}}"} instead.
                  </p>
                )}
              </div>

              {!hasNamed && currentVariables.length > 0 && (
                <div className="grid gap-4 mt-2 p-4 border border-border rounded-lg bg-muted/20">
                  <h3 className="font-medium text-sm text-foreground/80">
                    Variable Examples
                  </h3>
                  <p className="text-xs text-muted-foreground/80">
                    Provide example values for your variables to help reviewers
                    understand the template.
                  </p>
                  <div className="grid gap-3">
                    {currentVariables.map((variable) => (
                      <div
                        key={variable}
                        className="grid grid-cols-[100px_1fr] items-center gap-2"
                      >
                        <Label
                          htmlFor={`var-${variable}`}
                          className="text-xs font-medium truncate"
                        >
                          {"{{"}
                          {variable}
                          {"}}"}
                        </Label>
                        <Input
                          id={`var-${variable}`}
                          placeholder={`e.g. ${variable === "1" ? "John" : "value"}`}
                          value={examples[variable] || ""}
                          onChange={(e) =>
                            setExamples((prev) => ({
                              ...prev,
                              [variable]: e.target.value,
                            }))
                          }
                          className="h-8 text-sm transition-colors focus-visible:ring-primary/20"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 mt-auto pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createTemplate.isPending}
                className="font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createTemplate.isPending || !name || !bodyText || hasNamed
                }
                className="font-medium transition-all"
              >
                {createTemplate.isPending ? (
                  <>
                    <Loader className=" h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="hidden md:flex w-full bg-muted/30 p-6 border-l border-border flex-col relative max-h-[85vh]">
          <div className="mb-4">
            <h3 className="font-medium text-foreground/90 text-lg">Preview</h3>
            <p className="text-sm text-muted-foreground">
              This is how your message will look to users.
            </p>
          </div>

          <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] rounded-xl relative overflow-hidden shadow-sm flex flex-col border border-border/50">
            <div className="bg-[#005c4b] dark:bg-[#005c4b] text-white p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs font-medium">B</span>
              </div>
              <div>
                <div className="font-medium text-sm leading-tight">
                  Business Name
                </div>
                <div className="text-[10px] text-white/80">
                  business account
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col relative z-10 overflow-y-auto">
              {previewText ? (
                <div className="bg-white dark:bg-[#202c33] rounded-lg p-3 text-sm flex flex-col gap-2 relative shadow-sm w-full max-w-[90%] self-start rounded-tl-none">
                  <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[12px] border-r-white dark:border-r-[#202c33] border-b-[16px] border-b-transparent drop-shadow-sm"></div>

                  <div className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                    {previewText}
                  </div>

                  <div className="text-[11px] text-foreground/40 text-right mt-1 pointer-events-none select-none">
                    11:38
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Start typing to see a preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTemplateDialog;
