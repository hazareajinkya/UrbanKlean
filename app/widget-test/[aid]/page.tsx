"use client";

import { useAgent } from "@/lib/hooks/agent/use-agent";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function WidgetTestPage() {
  const { aid } = useParams() as { aid: string };
  const { agent, isLoading } = useAgent(aid);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading widget test...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Agent Not Found
          </h1>
          <p className="text-gray-600">
            The requested agent could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Widget Test Environment */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Widget Test - {agent.customization.name}
            </h1>
            <p className="text-gray-600">
              The chat widget should appear in the bottom-right corner. Click it
              to test!
            </p>
          </div>

          {/* Test Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <p className="text-sm">
                      Look for the floating chat button in the bottom-right
                      corner
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <p className="text-sm">
                      Click the button to open the chat interface
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <p className="text-sm">
                      Send a test message to verify functionality
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <p className="text-sm">
                      Try closing and reopening the widget
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Widget Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Bot Name:</strong>
                    <div>{agent.customization.name}</div>
                  </div>
                  <div>
                    <strong>Bot Icon:</strong>
                    <div className="flex items-center gap-2">
                      {agent.customization.botIcon.startsWith("http") ? (
                        <img
                          src={agent.customization.botIcon}
                          alt="Bot icon"
                          className="w-6 h-6 rounded"
                        />
                      ) : (
                        <span className="text-lg">
                          {agent.customization.botIcon}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {agent.customization.botIcon.startsWith("http")
                          ? "Image URL"
                          : "Emoji/Text"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong>Primary Color:</strong>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: agent.customization.primaryColor,
                        }}
                      />
                      <span className="font-mono text-xs">
                        {agent.customization.primaryColor}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong>Agent ID:</strong>
                    <div className="font-mono text-xs">{aid}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Embed Code */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
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
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Copy this code and paste it before the closing &lt;/body&gt;
                  tag
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/chat/${aid}`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Chat Page
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Content */}
          <div className="mt-12 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Sample Website Content
              </h2>
              <p className="text-gray-600">
                This content simulates a real website where your widget would be
                embedded
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">🚀</div>
                  <h3 className="font-semibold mb-2">Fast Performance</h3>
                  <p className="text-sm text-gray-600">
                    Lightning-fast loading times and optimized user experience
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">💡</div>
                  <h3 className="font-semibold mb-2">Smart Solutions</h3>
                  <p className="text-sm text-gray-600">
                    Intelligent features that adapt to your business needs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">🔒</div>
                  <h3 className="font-semibold mb-2">Secure & Reliable</h3>
                  <p className="text-sm text-gray-600">
                    Enterprise-grade security with 99.9% uptime guarantee
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">
                  About Your Widget
                </h3>
                <p className="text-gray-600 mb-4">
                  The chat widget integrates seamlessly into any website with
                  just a single script tag. It appears as a floating button that
                  opens a full-featured chat interface when clicked.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Fully responsive for mobile and desktop</li>
                  <li>✅ Customizable to match your brand colors</li>
                  <li>✅ Secure with iframe isolation</li>
                  <li>
                    ✅ All agent features included (knowledge base, workflows,
                    etc.)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Load the actual widget script */}
      <Script
        src={`/api/widget2/${aid}`}
        async
        // strategy="lazyOnload"
        onLoad={() => {
          console.log("SuperCX Widget loaded successfully in test environment");
        }}
      />
    </div>
  );
}
