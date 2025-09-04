"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WebsiteTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Website tab content will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
