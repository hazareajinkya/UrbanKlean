"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAgent } from "@/lib/types/agent";
import { MessageCircle } from "lucide-react";

interface ChatTabProps {
  agent: IAgent;
}

export default function ChatTab({ agent }: ChatTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat Interface
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Chat interface functionality will be implemented here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
