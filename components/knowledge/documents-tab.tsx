"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Documents tab content will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
