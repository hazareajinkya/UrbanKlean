"use client";

import { IPerson } from "@/lib/types/person";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { Mail, Phone, Building2, ArrowLeftRight } from "lucide-react";

interface IdenticalPersonCardProps {
  personA: IPerson;
  personB: IPerson;
  onClick: () => void;
}

export default function IdenticalPersonCard({
  personA,
  personB,
  onClick,
}: IdenticalPersonCardProps) {
  const getLastFourId = (id: string) => id.slice(-4);

  const renderPerson = (person: IPerson) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border border-border/40 shrink-0">
        <AvatarImage src="" />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {getInitials(person.name || "?")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">
            {person.name || "Unknown"}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/60 bg-secondary/50 px-1.5 py-0.5 rounded">
            #{getLastFourId(person.id)}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {person.emails?.[0] && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span className="truncate max-w-[160px]">
                {person.emails[0].value}
              </span>
            </div>
          )}
          {person.phones?.[0] && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span className="truncate">{person.phones[0].value}</span>
            </div>
          )}
          {person.company && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{person.company}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_1fr_1fr] items-center gap-4 p-4 border-b border-border/50",
        "cursor-pointer transition-colors hover:bg-muted/50",
        "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View and compare ${personA.name || "Unknown"} and ${
        personB.name || "Unknown"
      }`}
    >
      {/* Person A - Left */}
      <div className="min-w-0">{renderPerson(personA)}</div>

      {/* Link Icon - Center */}
      <div className="flex items-center justify-center w-full shrink-0">
        <ArrowLeftRight className="w-4 h-4 text-primary mx-auto" />
      </div>

      {/* Person B - Right */}
      <div className="min-w-0">{renderPerson(personB)}</div>
    </div>
  );
}
