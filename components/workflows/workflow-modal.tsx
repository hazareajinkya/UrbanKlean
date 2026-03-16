"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Modal from "@/components/ui/modal";
import { X, Loader } from "lucide-react";
import ActionMentions from "./action-mentions";
import WorkflowActionsList from "./workflow-actions-list";
import { useAIActions } from "@/lib/hooks/actions/use-ai-actions";
import { getwid } from "@/lib/utils";

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    trigger: string;
    instructions: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      trigger: string;
      instructions: string;
    }>
  >;
  onSubmit: (e: React.FormEvent, toolIds: string[]) => void;
  isLoading: boolean;
  isEditing: boolean;
}

const WorkflowModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isLoading,
  isEditing,
}: WorkflowModalProps) => {
  const wid = getwid();
  const { actions } = useAIActions(wid);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Extract action IDs from instructions
  const extractToolIds = (instructions: string): string[] => {
    if (!actions) return [];

    const mentionRegex = /@([\w-]+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(instructions)) !== null) {
      const actionSlug = match[1];
      const action = actions.find((a) => a.slug === actionSlug);
      if (action && !mentions.includes(action.id)) {
        mentions.push(action.id);
      }
    }

    return mentions;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    const toolIds = extractToolIds(formData.instructions);
    onSubmit(e, toolIds);
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      w-full
      className={`max-w-2xl bg-white dark:bg-gray-900 rounded-xl p-6 transition-all duration-300`}
    >
      <div className="space-y-6 ">
        <div className="flex items-center justify-between pb-1 border-b">
          <h3 className="text-lg font-medium flex items-center gap-2">
            {isEditing ? "Edit Workflow" : "Create New Workflow"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Pricing Inquiry"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="mt-2"
              required
            />
          </div>

          {/* Trigger Field */}
          <div>
            <Label htmlFor="trigger">When should this workflow be used?</Label>
            <Textarea
              id="trigger"
              placeholder="If user is asking about pricing plans, costs, or wants to know how much the service costs..."
              value={formData.trigger}
              onChange={(e) => handleInputChange("trigger", e.target.value)}
              className="mt-2"
              rows={3}
              required
            />
          </div>

          {/* Instructions Field */}
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <ActionMentions
              value={formData.instructions}
              onChange={(value) => handleInputChange("instructions", value)}
              placeholder={`Type @ to mention actions...

1. Acknowledge their interest in our pricing

2. Ask about their specific needs and use case

3. Present the most relevant pricing tier

4. Highlight key features included in each plan

5. Offer to connect them with sales for custom pricing

6. Provide clear next steps or trial options

`}
              className="mt-2 h-[320px] w-full px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              rows={8}
            />

            {/* Actions List */}
            <WorkflowActionsList instructions={formData.instructions} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || isLoading}>
              {isLoading && <Loader className="w-4 h-4 animate-spin " />}
              {isEditing ? "Update Workflow" : "Create Workflow"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default WorkflowModal;
