"use client";

import { useParams } from "next/navigation";
import { useWaTemplates } from "@/lib/hooks/whatsapp/use-wa-templates";
import { useWaTemplateActions } from "@/lib/hooks/whatsapp/use-wa-template-actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader, Plus, RefreshCw } from "lucide-react";
import TemplateList from "@/components/wa-templates/template-list";
import CreateTemplateDialog from "@/components/wa-templates/create-template-dialog";

const WaTemplatesPage = () => {
  const { wid } = useParams() as { wid: string };
  const { data: templates, isLoading } = useWaTemplates(wid);
  const { syncTemplates } = useWaTemplateActions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl ">WhatsApp Templates</h1>
          <p className="text-sm text-muted-foreground">
            Manage your Meta WhatsApp Business message templates. Templates must
            be approved by Meta before they can be sent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => syncTemplates.mutate(wid)}
            disabled={syncTemplates.isPending || isLoading}
            className="transition-all"
          >
            <RefreshCw
              className={`w-4 h-4  ${syncTemplates.isPending ? "animate-spin" : ""}`}
            />
            Sync from Meta
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TemplateList templates={templates || []} wid={wid} />
      )}

      {isCreateModalOpen && (
        <CreateTemplateDialog
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          wid={wid}
        />
      )}
    </div>
  );
};

export default WaTemplatesPage;
