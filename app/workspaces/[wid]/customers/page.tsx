"use client";

import { usePeople } from "@/lib/hooks/people/use-people";
import { useParams } from "next/navigation";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { IPerson } from "@/lib/types/person";
import CustomerEditForm from "@/components/customers/customer-edit-form";
import CustomerListRow from "@/components/customers/customer-list-row";
import CustomerDetailPanel from "@/components/customers/customer-detail-panel";

export default function CustomersPage() {
  const { wid } = useParams() as { wid: string };
  const { people, hasMore, loadMore, nPeople } = usePeople(wid);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);

  const handleSelect = (person: IPerson) => {
    setSelectedPerson(person);
    setIsDetailPanelOpen(true);
  };

  const handleEdit = (person: IPerson) => {
    setSelectedPerson(person);
    setIsEditFormOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
  };

  const filteredPeople = people.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.emails?.some((e) => e.toLowerCase().includes(q)) ||
      p.phones?.some((ph) => ph.includes(q)) ||
      p.company?.toLowerCase().includes(q)
    );
  });

  const showDetailPanel = selectedPerson && isDetailPanelOpen;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-full p-4">
        <div className="bg-card border rounded-xl h-full overflow-hidden flex w-full">
          {/* Customers List */}
          <aside className="w-full p-0 border-r flex flex-col">
            {/* Header */}
            <div className="border-b bg-muted/10 px-4 py-3 flex flex-col gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Customers</p>
                <span className="text-xs text-muted-foreground">{nPeople}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Customer List */}
            <div
              className="flex-1 overflow-y-auto no-scrollbar bg-secondary"
              id="customersScrollableDiv"
            >
              {people.length === 0 && !hasMore ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 opacity-50" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    No customers yet
                  </h3>
                  <p className="text-xs max-w-sm">
                    Customers will appear here when they interact with your
                    agents.
                  </p>
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={filteredPeople.length}
                  scrollableTarget="customersScrollableDiv"
                  scrollThreshold={0.8}
                  next={loadMore}
                  hasMore={hasMore}
                  loader={
                    <div className="py-4 text-center mx-auto w-full">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  }
                  endMessage={
                    <div className="py-4 text-sm text-center text-muted-foreground">
                      {filteredPeople.length > 0
                        ? "End of customers"
                        : "No customers found"}
                    </div>
                  }
                >
                  {filteredPeople.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 opacity-50 mb-2" />
                      <p className="text-xs">No customers match your search</p>
                    </div>
                  ) : (
                    <div>
                      {filteredPeople.map((person) => (
                        <CustomerListRow
                          key={person.id}
                          person={person}
                          onSelect={handleSelect}
                          onEdit={handleEdit}
                          isSelected={selectedPerson?.id === person.id}
                        />
                      ))}
                    </div>
                  )}
                </InfiniteScroll>
              )}
            </div>
          </aside>

          {/* Customer Detail Panel */}
          {showDetailPanel && (
            <aside className="w-[500px] flex-shrink-0 flex flex-col overflow-hidden border-l">
              <CustomerDetailPanel
                person={selectedPerson}
                onEdit={handleEdit}
                onClose={handleCloseDetailPanel}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <CustomerEditForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
        }}
        person={selectedPerson}
        wid={wid}
      />
    </div>
  );
}
