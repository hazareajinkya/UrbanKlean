"use client";

import { useAllIdenticalPersons } from "@/lib/hooks/people/use-people";
import { IPerson } from "@/lib/types/person";
import { useState } from "react";
import IdenticalPersonCard from "./identical-person-card";
import IdenticalPersonsCompareView from "./identical-persons-compare-view";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeopleActions } from "@/lib/hooks/people/use-people-actions";

interface IdenticalPersonsListProps {
  wid: string;
}

type SelectedPair = {
  personA: IPerson;
  personB: IPerson;
} | null;

export default function IdenticalPersonsList({
  wid,
}: IdenticalPersonsListProps) {
  const { data: identicalPersons = [], isLoading } =
    useAllIdenticalPersons(wid);
  const [selectedPair, setSelectedPair] = useState<SelectedPair>(null);
  const [mergedPerson, setMergedPerson] = useState<IPerson | null>(null);
  const { mergePerson, notMergePersons } = usePeopleActions();

  // Group persons into pairs based on identicalPersonIds
  const pairs: { personA: IPerson; personB: IPerson }[] = [];
  const processedIds = new Set<string>();

  for (const person of identicalPersons) {
    if (processedIds.has(person.id)) continue;

    if (person.identicalPersonIds && person.identicalPersonIds.length > 0) {
      // Get the first identical person
      const identicalPersonId = person.identicalPersonIds[0];
      const identicalPerson = identicalPersons.find(
        (p) => p.id === identicalPersonId
      );

      if (identicalPerson) {
        pairs.push({
          personA: person,
          personB: identicalPerson,
        });
        processedIds.add(person.id);
        processedIds.add(identicalPerson.id);
      }
    }
  }

  const handlePairSelect = (pair: { personA: IPerson; personB: IPerson }) => {
    setSelectedPair(pair);
    setMergedPerson(null);
  };

  const handleBack = () => {
    setSelectedPair(null);
    setMergedPerson(null);
  };

  const handleMergeComplete = (merged: IPerson) => {
    setMergedPerson(merged);
  };

  const handleNotMerge = async () => {
    if (!selectedPair) return;
    try {
      await notMergePersons.mutateAsync({
        wid,
        personAId: selectedPair.personA.id,
        personBId: selectedPair.personB.id,
      });
      handleBack();
    } catch (error) {
      console.error("Not merge failed:", error);
    }
  };
  const handleMerge = async () => {
    if (!selectedPair) return;

    try {
      const result = await mergePerson.mutateAsync({
        wid,
        personAId: selectedPair.personA.id,
        personBId: selectedPair.personB.id,
      });
      setMergedPerson(result);
      handleMergeComplete(result);
    } catch (error) {
      console.error("Merge failed:", error);
    }
  };

  if (selectedPair) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-secondary border-b shrink-0">
          <div className="h-10 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-7 px-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              <div className="h-4 w-px bg-border/60" />
              <span className="text-sm text-muted-foreground">
                Comparing {selectedPair.personA.name || "Unknown"} &{" "}
                {selectedPair.personB.name || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleNotMerge}
                disabled={notMergePersons.isPending}
                className="min-w-[160px]"
              >
                {notMergePersons.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Not the same person
              </Button>
              <Button
                onClick={handleMerge}
                disabled={mergePerson.isPending}
                className="min-w-[140px]"
              >
                {mergePerson.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Merge Persons
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <IdenticalPersonsCompareView
            personA={selectedPair.personA}
            mergedPerson={mergedPerson ?? undefined}
            personB={selectedPair.personB}
            wid={wid}
            onBack={handleBack}
            onMergeComplete={handleMergeComplete}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <IdenticalPersonsTableSkeleton />;
  }

  if (pairs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="space-y-3">
          <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto ring-8 ring-secondary/20">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            No Duplicates Found
          </h3>
          <p className="text-muted-foreground max-w-sm">
            All customers are unique. No identical persons detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-4 px-4 py-3 bg-secondary border-b sticky top-0 z-10">
        <div className="text-sm font-medium text-muted-foreground">
          Person A
        </div>
        <div className="w-10 flex items-center justify-center">
          <span className="sr-only">Link</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Person B
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {pairs.map((pair, index) => (
          <IdenticalPersonCard
            key={`${pair.personA.id}-${pair.personB.id}-${index}`}
            personA={pair.personA}
            personB={pair.personB}
            onClick={() => handlePairSelect(pair)}
          />
        ))}
      </div>
    </div>
  );
}

const IdenticalPersonsTableSkeleton = () => {
  const renderPersonSkeleton = () => (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Skeleton className="h-3 w-[140px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-4 px-4 py-3 bg-secondary border-b sticky top-0 z-10">
        <div className="text-sm font-medium text-muted-foreground">
          Person A
        </div>
        <div className="w-10 flex items-center justify-center">
          <span className="sr-only">Link</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Person B
        </div>
      </div>

      {/* Skeleton List */}
      <div className="flex-1 overflow-auto">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 border-b border-border/50"
          >
            {/* Person A Skeleton */}
            <div className="min-w-0">{renderPersonSkeleton()}</div>

            {/* Center Icon Skeleton */}
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />

            {/* Person B Skeleton */}
            <div className="min-w-0">{renderPersonSkeleton()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
