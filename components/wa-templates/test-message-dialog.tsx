"use client";

import { useState, useEffect } from "react";
import { useWaTemplateActions } from "@/lib/hooks/whatsapp/use-wa-template-actions";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { IWaTemplate } from "@/lib/types/wa-api";

interface TestMessageDialogProps {
  wid: string;
  template: IWaTemplate;
  isOpen: boolean;
  onClose: () => void;
}

const TestMessageDialog = ({
  wid,
  template,
  isOpen,
  onClose,
}: TestMessageDialogProps) => {
  const { sendTestMessage } = useWaTemplateActions();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [headerParams, setHeaderParams] = useState<string[]>([]);
  const [bodyParams, setBodyParams] = useState<string[]>([]);

  useEffect(() => {
    if (!template) return;
    const headerComponent = template.components?.find(
      (c: any) => c.type === "HEADER",
    );
    const bodyComponent = template.components?.find(
      (c: any) => c.type === "BODY",
    );

    const extractVariables = (text?: string) => {
      if (!text) return 0;
      const matches = text.match(/\{\{(\d+)\}\}/g);
      if (!matches) return 0;
      const numbers = matches.map((m) => parseInt(m.replace(/\D/g, "")));
      return Math.max(...numbers);
    };

    const hCount =
      headerComponent?.format === "TEXT"
        ? extractVariables(headerComponent?.text)
        : headerComponent?.format === "IMAGE" ||
            headerComponent?.format === "DOCUMENT" ||
            headerComponent?.format === "VIDEO"
          ? 1
          : 0;

    const bCount = extractVariables(bodyComponent?.text);

    setHeaderParams(Array(hCount).fill(""));
    setBodyParams(Array(bCount).fill(""));
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    const submitComponents: any[] = [];
    const headerComponent = template.components?.find(
      (c: any) => c.type === "HEADER",
    );

    if (headerParams.length > 0) {
      if (headerComponent?.format === "TEXT") {
        submitComponents.push({
          type: "header",
          parameters: headerParams.map((p) => ({
            type: "text",
            text: p,
          })),
        });
      } else if (headerComponent?.format === "IMAGE") {
        submitComponents.push({
          type: "header",
          parameters: [
            {
              type: "image",
              image: { link: headerParams[0] },
            },
          ],
        });
      } else if (headerComponent?.format === "VIDEO") {
        submitComponents.push({
          type: "header",
          parameters: [
            {
              type: "video",
              video: { link: headerParams[0] },
            },
          ],
        });
      } else if (headerComponent?.format === "DOCUMENT") {
        submitComponents.push({
          type: "header",
          parameters: [
            {
              type: "document",
              document: { link: headerParams[0] },
            },
          ],
        });
      }
    }

    if (bodyParams.length > 0) {
      submitComponents.push({
        type: "body",
        parameters: bodyParams.map((p) => ({
          type: "text",
          text: p,
        })),
      });
    }

    try {
      await sendTestMessage.mutateAsync({
        wid,
        to: phoneNumber,
        templateName: template.name,
        languageCode: template.language,
        components: submitComponents.length > 0 ? submitComponents : undefined,
      });
      onClose();
    } catch (error) {
      // Error is handled in the mutation onError
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="w-full max-w-[425px] bg-background border border-border shadow-lg rounded-xl p-6"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="font-medium text-foreground/90 text-xl">
            Send Test Template
          </h2>
          <p className="text-sm font-medium text-muted-foreground/80">
            Test your approved template "{template.name}" before sending it to
            customers. Enter a valid WhatsApp phone number with country code
            (e.g., 15551234567).
          </p>
        </div>
        <div className="grid gap-4 py-6">
          <div className="grid gap-2">
            <Label htmlFor="phone" className="font-medium text-foreground/80">
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="15551234567"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/\D/g, ""))
              }
              className="transition-colors focus-visible:ring-primary/20"
              required
            />
          </div>

          {headerParams.length > 0 && (
            <div className="grid gap-2">
              <Label className="font-medium text-foreground/80">
                Header Parameters
              </Label>
              {headerParams.map((p, i) => (
                <Input
                  key={`header-${i}`}
                  placeholder={
                    template.components?.find((c: any) => c.type === "HEADER")
                      ?.format === "TEXT"
                      ? `{{${i + 1}}} value`
                      : "Media URL (e.g., https://example.com/image.jpg)"
                  }
                  value={p}
                  onChange={(e) => {
                    const newParams = [...headerParams];
                    newParams[i] = e.target.value;
                    setHeaderParams(newParams);
                  }}
                  className="transition-colors focus-visible:ring-primary/20"
                  required
                />
              ))}
            </div>
          )}

          {bodyParams.length > 0 && (
            <div className="grid gap-2">
              <Label className="font-medium text-foreground/80">
                Body Parameters
              </Label>
              {bodyParams.map((p, i) => (
                <Input
                  key={`body-${i}`}
                  placeholder={`{{${i + 1}}} value`}
                  value={p}
                  onChange={(e) => {
                    const newParams = [...bodyParams];
                    newParams[i] = e.target.value;
                    setBodyParams(newParams);
                  }}
                  className="transition-colors focus-visible:ring-primary/20"
                  required
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={sendTestMessage.isPending}
            className="font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={sendTestMessage.isPending || !phoneNumber}
            className="font-medium transition-all"
          >
            {sendTestMessage.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Test"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TestMessageDialog;
