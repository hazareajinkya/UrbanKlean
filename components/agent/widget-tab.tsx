"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IAgent } from "@/lib/types/agent";
import { Globe } from "lucide-react";

interface WidgetTabProps {
  agent: IAgent;
  wid: string;
  aid: string;
}

export default function WidgetTab({ agent, wid, aid }: WidgetTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Integration Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Quick Setup</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Copy the embed code from the implementation</li>
              <li>
                Paste it before the closing &lt;/body&gt; tag of your website
              </li>
              <li>The widget will automatically appear on your site</li>
              <li>Test the integration to ensure it's working properly</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium">Supported Platforms</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">WordPress</Badge>
              <Badge variant="outline">Shopify</Badge>
              <Badge variant="outline">React</Badge>
              <Badge variant="outline">Vue.js</Badge>
              <Badge variant="outline">HTML/CSS</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
