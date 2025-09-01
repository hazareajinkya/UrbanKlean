"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkspacesPage() {
  const router = useRouter();

  return (
    <div className="mt-12 px-4 md:px-24">
      <div className="flex gap-4 justify-between mb-8">
        <h2 className="text-xl font-medium">Workspaces</h2>
        <Button>
          <Plus className="w-4 h-4" />
          Workspace
        </Button>
      </div>
    </div>
  );
}
