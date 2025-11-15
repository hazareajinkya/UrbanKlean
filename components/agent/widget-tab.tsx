"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IAgent } from "@/lib/types/agent";
import { Globe, Copy, Check, ExternalLink, TestTube } from "lucide-react";
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

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";
  const embedCode = `<script 
  src="${baseUrl}/api/widget/${aid}"
  async>
</script>`;

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
        {/* Test Widget Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Test Your Widget
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test your widget in a simulated environment before embedding it on
              your website.
            </p>
            <div className="flex gap-3">
              <Link href={`/widget-test/${aid}`} target="_blank">
                <Button className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Widget Test
                </Button>
              </Link>
              <Link href={`/chat/${aid}`} target="_blank">
                <Button variant="outline" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  View Chat Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Embed Code Section */}
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
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Agent ID:</strong> {aid}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Primary Color:</strong>
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{
                      backgroundColor: agent.customization.primaryColor,
                    }}
                  />
                  {agent.customization.primaryColor}
                </div>
                <div>
                  <strong>Bot Name:</strong> {agent.customization.name}
                </div>
                <div>
                  <strong>Bot Icon:</strong> {agent.customization.botIcon}
                </div>
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
                <li>Use the test page above to verify functionality</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Features & Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle>Widget Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Floating chat button</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Modal chat interface</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Mobile responsive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Custom branding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure iframe embedding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cross-browser compatible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Knowledge base access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Workflow integration</span>
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
                <Badge variant="outline">Webflow</Badge>
                <Badge variant="outline">Custom Sites</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The widget creates a floating chat button on your website that
                opens your full chat interface in a secure iframe modal when
                clicked.
              </p>

              <div className="grid gap-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <strong>Script loads:</strong> Widget script loads
                    asynchronously without affecting page performance
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <strong>Button appears:</strong> Floating chat button
                    appears in bottom-right corner with your branding
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <strong>Chat opens:</strong> Click opens full chat interface
                    in secure iframe modal
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <strong>Full features:</strong> Users access all agent
                    capabilities including knowledge base and workflows
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-200 pl-4 bg-blue-50 p-3 rounded-r">
                <p className="text-blue-800 font-medium">
                  💡 Benefits: Complete functionality, secure isolation, easy
                  maintenance, and consistent experience across all platforms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
