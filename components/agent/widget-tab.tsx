"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IAgent } from "@/lib/types/agent";
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Forward,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

interface WidgetTabProps {
  agent: IAgent;
  wid: string;
  aid: string;
}

export default function WidgetTab({ agent, wid, aid }: WidgetTabProps) {
  const [copied, setCopied] = useState(false);
  const [iframeCopied, setIframeCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";
  const embedCode = `<script 
  src="${baseUrl}/api/widget/${aid}"
  async>
</script>`;

  const iframeEmbedCode = `<iframe
  src="${baseUrl}/chat/${aid}?fromPage=YOUR_PAGE_URL"
  style="width: 100%; height: 600px; border: none;"
  allow="microphone; camera; clipboard-write"
  title="Chat Widget">
</iframe>`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <ScrollArea className="h-full ">
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Deploy Your Agent</h2>
            <p className="text-sm text-muted-foreground ">
              Test and deploy your widget in a simulated environment before
              adding it on your website.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href={`/widget-test/${aid}`} target="_blank">
              <Button className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Widget Test
              </Button>
            </Link>
            <Link href={`/chat/${aid}`} target="_blank">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-card"
              >
                <MessageSquare className="w-4 h-4" />
                View Chat Page
              </Button>
            </Link>
            <Link href={`/share/${aid}`} target="_blank">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-card"
              >
                <Forward className="w-4 h-4" />
                Open Share Page
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="px-6 pt-2 pb-0">
              <CardTitle className="flex items-center justify-between">
                Embed Your Chat Widget
                <Globe className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  Copy and paste this code before the closing &lt;/body&gt; tag
                  of your website:
                </p>
                <div className="relative">
                  <Textarea
                    value={embedCode}
                    readOnly
                    className="font-mono text-sm bg-muted/50 resize-none"
                    rows={4}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="mb-2">Quick Setup</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground leading-relaxed">
                  <li>Copy the embed code above</li>
                  <li>
                    Paste it before the closing &lt;/body&gt; tag of your
                    website
                  </li>
                  <li>
                    The chat widget will automatically appear on your site
                  </li>
                  <li>Use the test page above to verify functionality</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Direct Iframe Embed */}
          <Card>
            <CardHeader className="px-6 pt-2 pb-0">
              <CardTitle className="flex items-center justify-between">
                Direct Iframe Embed
                <ExternalLink className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                For custom integrations, you can embed the chat directly using
                an iframe. Include the{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  fromPage
                </code>{" "}
                parameter to track which page the conversation started from.
              </p>
              <div className="relative">
                <Textarea
                  value={iframeEmbedCode}
                  readOnly
                  className="font-mono text-sm bg-muted/50 resize-none"
                  rows={6}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={async () => {
                    await navigator.clipboard.writeText(iframeEmbedCode);
                    setIframeCopied(true);
                    setTimeout(() => setIframeCopied(false), 2000);
                  }}
                >
                  {iframeCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="border-l-4 border-amber-200 pl-4 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-r">
                <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                  <strong>Important:</strong> Replace{" "}
                  <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-xs">
                    YOUR_PAGE_URL
                  </code>{" "}
                  with the actual URL of the page where the iframe is embedded
                  (e.g.,{" "}
                  <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-xs">
                    https://yourpage.com/support
                  </code>
                  ). This allows you to track where conversations originate
                  from.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Embed Code Section */}
      </div>
    </ScrollArea>
  );
}
