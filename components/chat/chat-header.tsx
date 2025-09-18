"use client";

import { Button } from "@/components/ui/button";
import { IAgent } from "@/lib/types/agent";
import { getContrastingColor } from "@/lib/utils";
import { RotateCcw, X } from "lucide-react";
import { refreshSession } from "./chat-utils";

export const ChatHeader = ({
  agent,
  isWidget = false,
}: {
  agent: IAgent;
  isWidget?: boolean;
}) => {
  const handleRefresh = () => {
    refreshSession(agent);
  };

  const handleClose = () => {
    if (isWidget) {
      // Notify parent window to close the widget
      window.parent.postMessage({ type: "SUPERCX_WIDGET_CLOSE" }, "*");
    } else {
      // TODO: Implement close functionality for regular chat
      console.log("Close clicked");
    }
  };

  const brandColor = agent.customization.primaryColor;
  const fontColor = getContrastingColor(brandColor);

  return (
    <div
      className="bg-gradient-to-r text-white px-4 pr-2 py-3"
      style={{
        backgroundColor: brandColor,
        color: fontColor,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">{agent.customization.name}</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="text-white hover:bg-white/20 hover:text-white h-8 w-8"
            style={{ color: fontColor }}
            aria-label="Refresh chat"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20 hover:text-white h-8 w-8"
            style={{ color: fontColor }}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
