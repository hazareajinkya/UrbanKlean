"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IAgent } from "@/lib/types/agent";
import { Globe, Copy, Check } from "lucide-react";
import { useState } from "react";

interface WidgetTabProps {
  agent: IAgent;
  wid: string;
  aid: string;
}

export default function WidgetTab({ agent, wid, aid }: WidgetTabProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const embedCode = `<script src="${baseUrl}/api/widget/${aid}/script"></script>`;

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Embed Your Chat Widget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Embed Code</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Copy and paste this code before the closing &lt;/body&gt; tag of
              your website:
            </p>
            <div className="relative">
              <Textarea
                value={embedCode}
                readOnly
                className="font-mono text-sm bg-muted/50 resize-none"
                rows={3}
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
            <h4 className="font-medium mb-2">Quick Setup</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Copy the embed code above</li>
              <li>
                Paste it before the closing &lt;/body&gt; tag of your website
              </li>
              <li>The chat widget will automatically appear on your site</li>
              <li>Test the integration to ensure it's working properly</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-2">Widget Features</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Full chat interface</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Iframe-based (secure)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Mobile responsive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All agent features</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Knowledge base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Workflows & actions</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Supported Platforms</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">WordPress</Badge>
              <Badge variant="outline">Shopify</Badge>
              <Badge variant="outline">React</Badge>
              <Badge variant="outline">Vue.js</Badge>
              <Badge variant="outline">HTML/CSS</Badge>
              <Badge variant="outline">Next.js</Badge>
              <Badge variant="outline">Squarespace</Badge>
              <Badge variant="outline">Wix</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="text-sm text-muted-foreground mb-2">
              Your widget will appear as a floating chat button in the
              bottom-right corner of your website.
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Chat button appears in bottom-right corner</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Clicking opens the full chat interface in iframe</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>All your agent's features are available</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Mobile: full-screen experience</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">How It Works</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                The widget uses an iframe to embed your full chat interface
                directly into any website. This approach provides:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Complete functionality:</strong> All features from
                  your chat page work in the widget
                </li>
                <li>
                  <strong>Security:</strong> Iframe isolation prevents conflicts
                  with the host website
                </li>
                <li>
                  <strong>Easy maintenance:</strong> Updates to your chat
                  automatically appear in the widget
                </li>
                <li>
                  <strong>Consistent experience:</strong> Users get the same
                  interface across all platforms
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
