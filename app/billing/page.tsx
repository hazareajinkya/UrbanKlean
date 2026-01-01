"use client";

import { WorkspacesNavbar } from "@/components/workspaces/workspace-navbar";

export default function BillingPage() {
  return (
    <>
      <WorkspacesNavbar />
      <div className="mt-24 min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-medium text-muted-foreground">Billing</h1>
      </div>
    </>
  );
}
