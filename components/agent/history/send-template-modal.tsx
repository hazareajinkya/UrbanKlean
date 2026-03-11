"use client";

import { useState, useMemo, useEffect } from "react";
import { useWaTemplateActions } from "@/lib/hooks/whatsapp/use-wa-template-actions";
import { useWaTemplates } from "@/lib/hooks/whatsapp/use-wa-templates";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { IWaTemplate } from "@/lib/types/wa-api";

interface SendTemplateModalProps {
  wid: string;
  to: string;
  aid?: string;
  sessionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const SendTemplateModal = ({
  wid,
  to,
  aid,
  sessionId,
  isOpen,
  onClose,
}: SendTemplateModalProps) => {
  const { data: templates = [], isLoading: templatesLoading } =
    useWaTemplates(wid);
  const { sendTemplateMessage } = useWaTemplateActions();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, string>>({});

  const approvedTemplates = useMemo(
    () => templates.filter((t: IWaTemplate) => t.status === "APPROVED"),
    [templates],
  );

  const selectedTemplate = useMemo(
    () => templates.find((t: IWaTemplate) => t.id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  const bodyComponent = useMemo(
    () => selectedTemplate?.components?.find((c: any) => c.type === "BODY"),
    [selectedTemplate],
  );

  const bodyText = bodyComponent?.text || "";

  const posMatches: string[] = useMemo(() => {
    if (!bodyText) return [];
    return Array.from(
      new Set(
        (bodyText.match(/\{\{(\d+)\}\}/g) || []).map((m: string) =>
          m.replace(/[{}]/g, ""),
        ),
      ),
    ).sort((a, b) => parseInt(a as string) - parseInt(b as string)) as string[];
  }, [bodyText]);

  useEffect(() => {
    setVariables({});
  }, [selectedTemplateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      let components: any[] = [];
      if (posMatches.length > 0) {
        const parameters = posMatches.map((pos: string) => ({
          type: "text",
          text: variables[pos] || "",
        }));

        components = [
          {
            type: "body",
            parameters,
          },
        ];
      }

      await sendTemplateMessage.mutateAsync({
        wid,
        to,
        templateName: selectedTemplate.name,
        languageCode: selectedTemplate.language || "en_US",
        components: components.length > 0 ? components : undefined,
        aid,
        sessionId,
        previewText,
      });
      onClose();
    } catch (error) {
      console.error("Failed to send template message", error);
    }
  };

  let previewText = bodyText;
  if (posMatches.length > 0) {
    posMatches.forEach((match: string) => {
      const val = variables[match] || `{{${match}}}`;
      previewText = previewText.replace(
        new RegExp(`\\{\\{${match}\\}\\}`, "g"),
        val,
      );
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="w-full max-w-4xl bg-background border border-border shadow-lg rounded-xl p-0 overflow-hidden min-h-[50vh] "
    >
      <div className=" grid grid-cols-1 md:grid-cols-2">
        <div className="w-full  p-6 flex flex-col max-h-[85vh] min-h-[50vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="font-medium text-foreground/90 text-xl">
                Send WhatsApp Template
              </h2>
              <p className="text-muted-foreground/80 text-sm font-medium">
                Select an approved template and fill in any required variables.
              </p>
            </div>
            <div className="grid gap-5 py-6">
              <div className="grid gap-2">
                <Label
                  htmlFor="template"
                  className="text-foreground/80 font-medium"
                >
                  Template
                </Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={(val) => setSelectedTemplateId(val)}
                  disabled={templatesLoading}
                >
                  <SelectTrigger
                    id="template"
                    className="transition-colors focus-visible:ring-primary/20"
                  >
                    <SelectValue
                      placeholder={
                        templatesLoading
                          ? "Loading templates..."
                          : "Select a template"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedTemplates.length === 0 && !templatesLoading ? (
                      <SelectItem value="none" disabled>
                        No approved templates available
                      </SelectItem>
                    ) : (
                      approvedTemplates.map((template: IWaTemplate) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.language})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {posMatches.length > 0 && selectedTemplate && (
                <div className="grid gap-4 mt-2 p-4 border border-border rounded-lg bg-muted/20">
                  <h3 className="font-medium text-sm text-foreground/80">
                    Template Variables
                  </h3>
                  <div className="grid gap-3">
                    {posMatches.map((variable: string) => (
                      <div key={variable} className="grid gap-1.5">
                        <Label
                          htmlFor={`var-${variable}`}
                          className="text-xs font-medium"
                        >
                          Variable {"{{"}
                          {variable}
                          {"}}"}
                        </Label>
                        <Input
                          id={`var-${variable}`}
                          placeholder={`Value for {{${variable}}}`}
                          value={variables[variable] || ""}
                          onChange={(e) =>
                            setVariables((prev) => ({
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
                disabled={sendTemplateMessage.isPending}
                className="font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendTemplateMessage.isPending || !selectedTemplateId}
                className="font-medium transition-all"
              >
                {sendTemplateMessage.isPending ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className=" bg-muted/30 p-6 border-l border-border flex-col relative max-h-[85vh] w-full">
          <div className="mb-4">
            <h3 className="font-medium text-foreground/90 text-lg">
              Live Preview
            </h3>
            <p className="text-sm text-muted-foreground">
              This is how your message will look to the customer.
            </p>
          </div>

          <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] rounded-xl relative overflow-hidden shadow-sm flex flex-col border border-border/50">
            <div className="bg-[#005c4b] dark:bg-[#005c4b] text-white p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs font-medium">WA</span>
              </div>
              <div>
                <div className="font-medium text-sm leading-tight">
                  WhatsApp Chat
                </div>
                <div className="text-[10px] text-white/80">
                  Business Account
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col relative z-10 overflow-y-auto">
              {selectedTemplateId ? (
                <div className="bg-white dark:bg-[#202c33] rounded-lg p-3 text-sm flex flex-col gap-2 relative shadow-sm w-full max-w-[90%] self-start rounded-tl-none">
                  <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[12px] border-r-white dark:border-r-[#202c33] border-b-[16px] border-b-transparent drop-shadow-sm"></div>

                  <div className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                    {previewText}
                  </div>

                  <div className="text-[11px] text-foreground/40 text-right mt-1 pointer-events-none select-none">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Select a template to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SendTemplateModal;
