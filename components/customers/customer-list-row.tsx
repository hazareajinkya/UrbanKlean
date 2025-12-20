import { IPerson } from "@/lib/types/person";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface CustomerListRowProps {
  person: IPerson;
  onSelect: (person: IPerson) => void;
  onEdit: (person: IPerson) => void;
  isSelected?: boolean;
}

export default function CustomerListRow({
  person,
  onSelect,
  onEdit, // Currently not using onEdit, but keeping it in props as passed
  isSelected,
}: CustomerListRowProps) {
  return (
    <div
      onClick={() => onSelect(person)}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/40 hover:bg-muted/50",
        isSelected && "bg-muted border-l-2 border-l-primary pl-[11px]" // slightly adjust padding to account for border
      )}
    >
      <Avatar className="h-10 w-10 border border-border/50">
        <AvatarImage src="" /> {/* person doesn't have avatar url yet */}
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {getInitials(person.name || "Unknown")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4
            className={cn(
              "text-sm font-medium truncate",
              isSelected ? "text-foreground" : "text-foreground/90"
            )}
          >
            {person.name || "Unknown Customer"}
          </h4>
          {person.createdAt && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
              {formatDistanceToNow(new Date(person.createdAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            {person.emails && person.emails.length > 0 ? (
              <span className="truncate">{person.emails[0]}</span>
            ) : person.phones && person.phones.length > 0 ? (
              <span className="truncate">{person.phones[0]}</span>
            ) : (
              <span className="italic opacity-70 whitespace-nowrap">
                No contact info
              </span>
            )}

            {person.company && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                <span className="truncate">{person.company}</span>
              </>
            )}
          </div>

          {person.tags && person.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {person.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50 font-medium whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
              {person.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{person.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {person.interests && person.interests.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {person.tags && person.tags.length > 0 && (
                <div className="w-px h-3 bg-border mx-1" />
              )}
              {person.interests.slice(0, 2).map((interest, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/20 font-medium whitespace-nowrap"
                >
                  {interest}
                </span>
              ))}
              {person.interests.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{person.interests.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
