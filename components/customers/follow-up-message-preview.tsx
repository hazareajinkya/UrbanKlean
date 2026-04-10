"use client";

import {
  FileText,
  Image as ImageIcon,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IWaTemplate } from "@/lib/types/wa-api";

type WaPreviewComponent = {
  type?: string;
  format?: string;
  text?: string;
  buttons?: Array<{ text?: string }>;
};

const HEADER_MEDIA: Record<
  "IMAGE" | "VIDEO" | "DOCUMENT",
  { Icon: LucideIcon; label: string }
> = {
  IMAGE: { Icon: ImageIcon, label: "Image" },
  VIDEO: { Icon: Video, label: "Video" },
  DOCUMENT: { Icon: FileText, label: "Document" },
};

const WaMediaHeaderPreview = (args: {
  kind: keyof typeof HEADER_MEDIA;
}) => {
  const { Icon, label } = HEADER_MEDIA[args.kind];
  return (
    <>
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="text-xs">{label}</span>
    </>
  );
};

export const FollowUpMessagePreview = (args: { template: IWaTemplate }) => {
  const { template } = args;
  const components = template.components as WaPreviewComponent[] | undefined;
  const headerComponent = components?.find((c) => c.type === "HEADER");
  const bodyComponent = components?.find((c) => c.type === "BODY");
  const footerComponent = components?.find((c) => c.type === "FOOTER");
  const buttonsComponent = components?.find((c) => c.type === "BUTTONS");

  const mediaKind =
    headerComponent?.format === "IMAGE" ||
    headerComponent?.format === "VIDEO" ||
    headerComponent?.format === "DOCUMENT"
      ? headerComponent.format
      : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors">
      <div className="space-y-3">
        {headerComponent && (
          <div>
            {headerComponent.format === "TEXT" && headerComponent.text ? (
              <p className="text-sm font-medium text-foreground/90">
                {headerComponent.text}
              </p>
            ) : (
              <div className="flex h-24 items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground">
                {mediaKind ? (
                  <WaMediaHeaderPreview kind={mediaKind} />
                ) : (
                  <span className="text-xs">Header</span>
                )}
              </div>
            )}
          </div>
        )}

        {bodyComponent?.text && (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
            {bodyComponent.text}
          </p>
        )}

        {footerComponent?.text && (
          <p className="border-t border-border pt-2 text-xs text-muted-foreground">
            {footerComponent.text}
          </p>
        )}

        {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
          <div className="flex flex-col gap-2">
            {buttonsComponent.buttons.map((btn, idx) => (
              <Button
                key={`preview-btn-${idx}`}
                type="button"
                variant="outline"
                size="sm"
                className="w-full opacity-90"
                disabled
                aria-label={
                  btn.text
                    ? `Template button preview: ${btn.text}`
                    : "Template button preview"
                }
              >
                {btn.text ?? "Button"}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
