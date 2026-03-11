"use client";

import React, { useState } from "react";
import { useWaTemplateActions } from "@/lib/hooks/whatsapp/use-wa-template-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit2,
  MoreHorizontal,
  Trash,
  Send,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  File,
} from "lucide-react";
import TestMessageDialog from "./test-message-dialog";
import EditTemplateDialog from "./edit-template-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { IWaTemplate } from "@/lib/types/wa-api";

interface TemplateListProps {
  wid: string;
  templates: IWaTemplate[];
}

const TemplateList = ({ wid, templates }: TemplateListProps) => {
  const { deleteTemplate } = useWaTemplateActions();
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [testMessageTemplate, setTestMessageTemplate] =
    useState<IWaTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<IWaTemplate | null>(
    null,
  );

  const handleDelete = () => {
    if (templateToDelete) {
      deleteTemplate.mutate({ wid, templateName: templateToDelete });
      setTemplateToDelete(null);
    }
  };

  const MessagePreview = ({ template }: { template: IWaTemplate }) => {
    const headerComponent = template.components?.find(
      (c) => c.type === "HEADER",
    );
    const bodyComponent = template.components?.find((c) => c.type === "BODY");
    const footerComponent = template.components?.find(
      (c) => c.type === "FOOTER",
    );
    const buttonsComponent = template.components?.find(
      (c) => c.type === "BUTTONS",
    );

    return (
      <div className="bg-white dark:bg-[#202c33] rounded-lg p-3 text-sm flex flex-col gap-2 relative shadow-sm max-h-[250px] overflow-y-auto w-full max-w-[90%] self-start rounded-tl-none">
        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[12px] border-r-white dark:border-r-[#202c33] border-b-[16px] border-b-transparent drop-shadow-sm"></div>

        {headerComponent && (
          <div className="font-medium text-foreground/90 mb-1">
            {headerComponent.format === "TEXT" && headerComponent.text ? (
              <span>{headerComponent.text}</span>
            ) : (
              <div className="flex items-center justify-center bg-black/5 dark:bg-black/10 rounded min-h-[100px] mb-2">
                {headerComponent.format === "IMAGE" && (
                  <ImageIcon className="w-8 h-8 text-black/20 dark:text-white/20" />
                )}
                {headerComponent.format === "VIDEO" && (
                  <Video className="w-8 h-8 text-black/20 dark:text-white/20" />
                )}
                {headerComponent.format === "DOCUMENT" && (
                  <File className="w-8 h-8 text-black/20 dark:text-white/20" />
                )}
              </div>
            )}
          </div>
        )}

        {bodyComponent && (
          <div className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
            {bodyComponent.text}
          </div>
        )}

        {footerComponent && (
          <div className="flex justify-between items-end gap-4 mt-1">
            <div className="text-xs text-foreground/50">
              {footerComponent.text}
            </div>
            <div className="text-[11px] text-foreground/40 whitespace-nowrap mb-0.5 pointer-events-none select-none">
              11:38
            </div>
          </div>
        )}
        {!footerComponent && (
          <div className="absolute bottom-1.5 right-2 text-[11px] text-foreground/40 pointer-events-none select-none">
            11:38
          </div>
        )}

        {buttonsComponent && buttonsComponent.buttons?.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2 border-t border-black/5 dark:border-white/5 pt-2">
            {buttonsComponent.buttons.map((btn: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-center text-[#00a884] dark:text-[#00a884] text-sm font-medium py-1"
              >
                {btn.text}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!templates?.length) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed">
        <h3 className="text-lg font-medium mb-2">No templates found</h3>
        <p className="text-sm text-muted-foreground max-w-sm border-none shadow-none">
          You haven't created any WhatsApp message templates yet. Create your
          first template to start sending automated outgoing messages.
        </p>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-none font-medium">
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="secondary"
            className="shadow-none border-none font-medium text-foreground/70"
          >
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/10 text-red-600 hover:bg-red-500/20 shadow-none border-none font-medium"
          >
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium">
            {status}
          </Badge>
        );
    }
  };

  const formatDisplayString = (str: string) => {
    if (!str) return "";
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="flex flex-col overflow-hidden hover:shadow-md transition-all duration-200 border-border group relative gap-0 p-0"
          >
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() => setTemplateToEdit(template)}
                    className="cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 " />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTestMessageTemplate(template)}
                    className="cursor-pointer"
                  >
                    <Send className="w-4 h-4 " />
                    Send Test
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTemplateToDelete(template.name)}
                    className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50"
                  >
                    <Trash className="w-4 h-4 " />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="p-4 flex-grow flex flex-col min-h-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-1.5 min-w-0 pr-8">
                  <h3 className="font-medium text-lg truncate leading-tight">
                    {formatDisplayString(template.name)}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium border-border/50 bg-muted/30 px-1.5 py-0 h-5"
                    >
                      {formatDisplayString(template.category)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium border-border/50 bg-muted/30 px-1.5 py-0 h-5"
                    >
                      {template.language}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-grow bg-[#efeae2] dark:bg-[#0b141a] p-4 flex flex-col overflow-hidden relative">
                <div className="relative z-10 flex-grow pt-2 pl-2">
                  <MessagePreview template={template} />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
              {getStatusBadge(template.status)}

              {template.status === "REJECTED" && template.rejected_reason && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium group/reason relative cursor-help">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>View Reason</span>
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-2.5 bg-background border rounded shadow-lg text-sm font-normal text-foreground opacity-0 group-hover/reason:opacity-100 transition-opacity pointer-events-none z-20">
                    <span className="font-medium text-red-600 block mb-1">
                      Rejection Reason:
                    </span>
                    {template.rejected_reason}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        description={`Are you sure you want to delete the template "${templateToDelete}"? This action cannot be undone and you will not be able to send messages using this template anymore.`}
        confirmText="Delete"
        isLoading={deleteTemplate.isPending}
        variant="destructive"
      />

      {testMessageTemplate && (
        <TestMessageDialog
          wid={wid}
          template={testMessageTemplate}
          isOpen={!!testMessageTemplate}
          onClose={() => setTestMessageTemplate(null)}
        />
      )}

      {templateToEdit && (
        <EditTemplateDialog
          wid={wid}
          template={templateToEdit}
          isOpen={!!templateToEdit}
          onClose={() => setTemplateToEdit(null)}
        />
      )}
    </>
  );
};

export default TemplateList;
