"use client";

import { IPerson } from "@/lib/types/person";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Eye,
  Pencil,
  Phone,
  Building2,
  Briefcase,
  MapPin,
} from "lucide-react";
import { getInitials, getPrimaryEmail, getPrimaryPhone } from "@/lib/utils";
import clsx from "clsx";

interface CustomerListRowProps {
  person: IPerson;
  onView: (person: IPerson) => void;
  onEdit: (person: IPerson) => void;
  isSelected?: boolean;
}

export default function CustomerListRow({
  person,
  onView,
  onEdit,
  isSelected = false,
}: CustomerListRowProps) {
  const handleRowClick = () => {
    onView(person);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(person);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(person);
  };

  const primaryEmail = getPrimaryEmail(person);
  const primaryPhone = getPrimaryPhone(person);

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 px-4 py-3 border-b border-border cursor-pointer transition-colors group",
        isSelected ? "bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={handleRowClick}
    >
      <div className="flex items-center gap-3  min-w-0">
        <Avatar className="h-10 w-10 border border-border bg-background flex-shrink-0">
          <AvatarImage src="" />
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
            {getInitials(person.name || "Unknown")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground truncate">
            {person.name || "Unnamed Customer"}
          </span>
          {primaryEmail ? (
            <span className="text-xs text-muted-foreground truncate">
              {primaryEmail}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={handleView}>
              <Eye className="h-4 w-4 mr-2" />
              View Customer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
