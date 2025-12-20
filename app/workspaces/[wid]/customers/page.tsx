"use client";

import { usePeople } from "@/lib/hooks/people/use-people";
import { useParams } from "next/navigation";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { IPerson } from "@/lib/types/person";
import CustomerViewModal from "@/components/customers/customer-view-modal";
import CustomerEditForm from "@/components/customers/customer-edit-form";
import CustomerListRow from "@/components/customers/customer-list-row";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const { wid } = useParams() as { wid: string };
  const { people, hasMore, loadMore, nPeople } = usePeople(wid);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleView = (person: IPerson) => {
    setSelectedPerson(person);
    setIsViewModalOpen(true);
  };

  const handleEdit = (person: IPerson) => {
    setSelectedPerson(person);
    setIsEditFormOpen(true);
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Customers</h1>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {nPeople}
          </span>
        </div>
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {people.length === 0 && !hasMore ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-6 w-6 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              No customers yet
            </h3>
            <p className="text-sm max-w-sm">
              Customers will appear here when they interact with your agents.
            </p>
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto no-scrollbar"
            id="customersScrollableDiv"
          >
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
                  <p className="text-sm">No customers match your search</p>
                </div>
              ) : (
                <div className="bg-card border rounded-xl m-4 overflow-hidden shadow-sm">
                  {/* Table Rows */}
                  {filteredPeople.map((person) => (
                    <CustomerListRow
                      key={person.id}
                      person={person}
                      onView={handleView}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              )}
            </InfiniteScroll>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPerson(null);
        }}
        person={selectedPerson}
      />

      <CustomerEditForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedPerson(null);
        }}
        person={selectedPerson}
        wid={wid}
      />
    </div>
  );
}
