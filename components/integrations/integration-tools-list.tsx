import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { IntegrationTool } from "@/lib/data/integration-configs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IntegrationToolsListProps {
  tools: IntegrationTool[];

  activeTab: "tools" | "triggers";
}

const IntegrationToolsList = ({
  tools,
  activeTab,
}: IntegrationToolsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const items = tools;

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${activeTab}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-2 pr-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No {activeTab} found matching your search.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default IntegrationToolsList;
