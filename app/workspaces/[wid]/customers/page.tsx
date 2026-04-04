"use client";

import { usePeople } from "@/lib/hooks/people/use-people";
import { useWorkspace } from "@/lib/hooks/workspace/use-workspace";
import { useParams } from "next/navigation";
import {
  type KeyboardEvent,
  type Ref,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Loader2,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Filter,
  Calendar,
  Globe,
  MessageCircleCode,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IChannelProvider } from "@/lib/types/channel";
import { IPerson } from "@/lib/types/person";
import CustomerFormModal from "@/components/customers/customer-form-modal";
import CustomerDetailPanel from "@/components/customers/customer-detail-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, cn, fromSlug, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import IdenticalPersonsList from "@/components/customers/identical-persons-list";
import {
  EmailIcon,
  InstagramIcon,
  MessengerIcon,
  SlackLogo,
  WAIcon,
} from "@/lib/logos";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChannelIcon = ({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) => {
  switch (provider) {
    case "whatsapp":
      return <WAIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "messenger":
      return <MessengerIcon className={className} />;
    case "slack":
      return <SlackLogo className={className} />;
    case "email":
      return <EmailIcon className={className} />;
    case "web":
      return <Globe className={cn("text-blue-500", className)} />;
    default:
      return <Globe className={cn("text-muted-foreground", className)} />;
  }
};

const ChannelAvatarStack = ({ person }: { person: IPerson }) => {
  const externalIds = Array.isArray(person.externalIds)
    ? person.externalIds
    : [];

  const providers = Array.from(
    new Set(
      externalIds.map((externalId) => externalId?.provider).filter(Boolean),
    ),
  );

  const maxVisible = 4;
  const displayProviders = providers.slice(0, maxVisible);
  const overflowCount = providers.length - displayProviders.length;

  return (
    <div className="flex items-center -space-x-2.5">
      {displayProviders.map((provider) => (
        <Tooltip key={provider}>
          <TooltipTrigger asChild>
            <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center p-0.5 shadow-sm transition-transform hover:z-10 hover:scale-110">
              <ChannelIcon provider={provider} className="w-full h-full" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="text-xs capitalize">{provider}</span>
          </TooltipContent>
        </Tooltip>
      ))}

      {overflowCount > 0 && (
        <div className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center shadow-sm z-0">
          <span className="text-[10px] font-medium text-secondary-foreground">
            +{overflowCount}
          </span>
        </div>
      )}

      {providers.length === 0 && (
        <div className="h-7 w-7 rounded-full bg-muted/20 border-2 border-dashed border-muted flex items-center justify-center">
          <MessageCircleCode className="w-3 h-3 text-muted-foreground/30" />
        </div>
      )}
    </div>
  );
};

const CUSTOMER_GRID_COLUMNS =
  "grid-cols-[minmax(300px,_1.9fr)_minmax(130px,_0.9fr)_minmax(200px,_1.25fr)_minmax(200px,_1.2fr)_minmax(200px,_1.2fr)_minmax(150px,_1fr)]";

const CustomerListRow = memo(function CustomerListRow({
  person,
  isSelected,
  onSelect,
  measureElement,
  start,
}: {
  person: IPerson;
  isSelected: boolean;
  onSelect: (person: IPerson) => void;
  measureElement: (element: Element | null) => void;
  start: number;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(person);
    }
  };

  return (
    <div
      ref={measureElement as Ref<HTMLDivElement>}
      role="button"
      tabIndex={0}
      aria-label={`Open ${person.name || "customer"}`}
      onClick={() => onSelect(person)}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute left-0 top-0 grid w-full min-w-[1180px] items-center border-b text-sm transition-colors hover:bg-muted/80",
        CUSTOMER_GRID_COLUMNS,
        isSelected && "bg-muted",
      )}
      style={{ transform: `translateY(${start}px)` }}
    >
      <div className="pl-6 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/40">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {getInitials(person.name || "?")}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {person.name || "Unknown"}
            </span>
            {person.location && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{person.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <ChannelAvatarStack person={person} />
      </div>

      <div>
        <div className="flex flex-col gap-1">
          {person.emails?.[0] ? (
            <div className="flex items-center gap-1.5 text-sm text-foreground/80">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="max-w-[180px] truncate">
                {person.emails[0].value}
              </span>
            </div>
          ) : null}
          {person.phones?.[0] ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span className="truncate">{person.phones[0].value}</span>
            </div>
          ) : null}
          {!person.emails?.[0] && !person.phones?.[0] && (
            <span className="text-xs italic text-muted-foreground">
              No contact info
            </span>
          )}
        </div>
      </div>

      <div>
        {person.company ? (
          <div className="flex flex-col">
            <span className="max-w-[150px] truncate text-sm font-medium">
              {person.company}
            </span>
            {person.title && (
              <span className="max-w-[150px] truncate text-xs text-muted-foreground">
                {person.title}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5">
          {person.tags?.slice(0, 2).map((tag, index) => (
            <Badge
              key={`${person.id}-${tag}-${index}`}
              variant="secondary"
              className="h-5 border border-border/50 bg-secondary/80 px-1.5 py-0 text-[10px] font-medium text-secondary-foreground hover:bg-secondary"
            >
              {fromSlug(tag)}
            </Badge>
          ))}
          {person.tags && person.tags.length > 2 && (
            <Badge variant="outline" className="h-5 px-1.5 py-0 text-[10px]">
              +{person.tags.length - 2}
            </Badge>
          )}
          {!person.tags?.length && (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      </div>

      <div className="pr-6 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-medium text-foreground/80">
            {getEngagementStatus(person)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(person.createdAt) || "-"}
          </span>
        </div>
      </div>
    </div>
  );
});

export default function CustomersPage() {
  const { wid } = useParams() as { wid: string };
  const { workspace } = useWorkspace(wid);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<IChannelProvider[]>(
    [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const {
    people,
    rawPeople,
    hasMore,
    loadMore,
    nPeople,
    isLoading,
    isFetchingNext,
  } = usePeople({
    wid,
    searchQuery: deferredSearchQuery,
    selectedChannels,
    selectedTags,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (person: IPerson) => {
      if (selectedPerson?.id === person.id && isDetailPanelOpen) {
        setIsDetailPanelOpen(false);
        setTimeout(() => setSelectedPerson(null), 200); // Wait for animation
      } else {
        setSelectedPerson(person);
        setIsDetailPanelOpen(true);
      }
    },
    [isDetailPanelOpen, selectedPerson?.id],
  );

  const handleEdit = useCallback((person: IPerson) => {
    setSelectedPerson(person);
    setIsEditFormOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsEditFormOpen(false);
    setIsAddCustomerOpen(false);
    setTimeout(() => setSelectedPerson(null), 200);
  }, []);

  const handleCloseDetailPanel = useCallback(() => {
    setIsDetailPanelOpen(false);
    setTimeout(() => setSelectedPerson(null), 200);
  }, []);

  const availableChannels = useMemo(() => {
    const providers = rawPeople.flatMap((person: IPerson) =>
      (Array.isArray(person.externalIds) ? person.externalIds : [])
        .map((externalId) => externalId?.provider)
        .filter((provider): provider is IChannelProvider => Boolean(provider)),
    );

    return Array.from(new Set<IChannelProvider>(providers)).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [rawPeople]);

  const availableTags = useMemo(
    () =>
      Array.from(new Set([workspace?.availableTags || []].flat())).sort(
        (a, b) => a.localeCompare(b),
      ),
    [workspace?.availableTags],
  );

  const hasActiveFilters =
    selectedChannels.length > 0 || selectedTags.length > 0;
  const activeFilterCount = selectedChannels.length + selectedTags.length;
  const shouldShowTagSearch = availableTags.length > 7;
  const filteredAvailableTags = useMemo(() => {
    const filteredAvailableTagsRaw = availableTags.filter((tag) =>
      fromSlug(tag).toLowerCase().includes(tagSearchQuery.trim().toLowerCase()),
    );
    const selectedTagsInFiltered = selectedTags.filter((tag) =>
      filteredAvailableTagsRaw.includes(tag),
    );
    const unselectedTagsInFiltered = filteredAvailableTagsRaw.filter(
      (tag) => !selectedTagsInFiltered.includes(tag),
    );

    return [...selectedTagsInFiltered, ...unselectedTagsInFiltered];
  }, [availableTags, selectedTags, tagSearchQuery]);

  const handleToggleChannel = useCallback((channel: IChannelProvider) => {
    setSelectedChannels((currentChannels) =>
      currentChannels.includes(channel)
        ? currentChannels.filter((currentChannel) => currentChannel !== channel)
        : [...currentChannels, channel],
    );
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedChannels([]);
    setSelectedTags([]);
  }, []);

  const handleClearSearchAndFilters = useCallback(() => {
    setSearchQuery("");
    handleClearFilters();
  }, [handleClearFilters]);

  const rowVirtualizer = useVirtualizer({
    count: people.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 74,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (showDuplicates || isFetchingNext || !hasMore) {
      return;
    }

    const lastVirtualRow = virtualRows[virtualRows.length - 1];

    if (!lastVirtualRow) {
      return;
    }

    if (lastVirtualRow.index >= people.length - 6) {
      loadMore();
    }
  }, [
    virtualRows,
    showDuplicates,
    isFetchingNext,
    hasMore,
    people.length,
    loadMore,
  ]);

  const emptyStateDescription =
    rawPeople.length === 0
      ? "There are no customers to display yet for the current workspace filters."
      : searchQuery.trim() || selectedChannels.length > 0
        ? "We couldn't find any customers matching the current search and filters. Try adjusting them and try again."
        : "There are no customers to display yet.";

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-11 px-6 border-b flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-foreground">Customers</h1>
          <div className="h-6 w-px bg-border/60" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{nPeople || 0} Total</span>
          </div>
          <div className="relative w-64 ">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9 h-8  bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {(searchQuery.trim() || hasActiveFilters) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearchAndFilters}
              className="h-8 px-2"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="sm"
                className="h-8"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-background/20 px-1.5 py-0.5 text-xs font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Filters</DropdownMenuLabel>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear all
                </Button>
              </div>
              <DropdownMenuSeparator />

              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Channels</DropdownMenuLabel>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setSelectedChannels([])}
                  disabled={selectedChannels.length === 0}
                >
                  Clear
                </Button>
              </div>
              {availableChannels.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  No channels found yet.
                </div>
              ) : (
                availableChannels.map((channel) => (
                  <DropdownMenuCheckboxItem
                    key={channel}
                    checked={selectedChannels.includes(channel)}
                    onCheckedChange={() => handleToggleChannel(channel)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    <div className="flex items-center gap-2">
                      <ChannelIcon provider={channel} className="h-4 w-4" />
                      <span>{getChannelLabel(channel)}</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))
              )}

              <DropdownMenuSeparator />

              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Tags</DropdownMenuLabel>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setSelectedTags([])}
                  disabled={selectedTags.length === 0}
                >
                  Clear
                </Button>
              </div>
              {shouldShowTagSearch && (
                <div className="sticky top-0 z-10 space-y-2 border-y bg-popover px-2 py-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={tagSearchQuery}
                      onChange={(event) =>
                        setTagSearchQuery(event.target.value)
                      }
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder="Search or select tags"
                      className="h-8 border-border/60 bg-background pl-8 pr-8"
                    />
                    {tagSearchQuery.trim() && (
                      <button
                        type="button"
                        aria-label="Clear tag search"
                        onClick={() => setTagSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-end text-[11px] text-muted-foreground">
                    {!tagSearchQuery.trim() && <span>Scroll to see more</span>}
                  </div>
                </div>
              )}
              {availableTags.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  No tags available for this workspace.
                </div>
              ) : filteredAvailableTags.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  No tags match your search.
                </div>
              ) : (
                <div className="px-2 pb-2">
                  <ScrollArea className="h-56 rounded-md ">
                    <div className="p-1">
                      {filteredAvailableTags.map((tag) => (
                        <DropdownMenuCheckboxItem
                          key={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleToggleTag(tag)}
                          onSelect={(event) => event.preventDefault()}
                        >
                          {fromSlug(tag)}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsAddCustomerOpen(true)}
            className="h-8"
          >
            <Plus className="w-4 h-4 " />
            Add Customer
          </Button>
          <Button
            variant={showDuplicates ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDuplicates(!showDuplicates)}
            className="h-8"
          >
            <Filter className="w-4 h-4 " />
            Identical Persons
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden m-4 bg-card border rounded-xl">
        {/* Main Table Area */}
        {showDuplicates ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <IdenticalPersonsList wid={wid} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-auto relative"
            >
              {isLoading && people.length === 0 ? (
                <CustomersTableSkeleton />
              ) : people.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4 ring-8 ring-secondary/20">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No customers found
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    {emptyStateDescription}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={handleClearSearchAndFilters}
                  >
                    Clear Search and Filters
                  </Button>
                </div>
              ) : (
                <div className="flex w-full min-w-[1180px] flex-col text-sm">
                  <div
                    className={cn(
                      "sticky top-0 z-10 grid w-full min-w-[1180px] items-center border-b bg-secondary",
                      CUSTOMER_GRID_COLUMNS,
                    )}
                  >
                    <div className="pl-6 py-3 text-sm text-muted-foreground">
                      Name
                    </div>
                    <div className="py-3 text-sm text-muted-foreground"></div>
                    <div className="py-3 text-sm text-muted-foreground">
                      Contact
                    </div>
                    <div className="py-3 text-sm text-muted-foreground">
                      Company
                    </div>
                    <div className="py-3 text-sm text-muted-foreground">
                      Tags
                    </div>
                    <div className="py-3 pr-6 text-right text-sm text-muted-foreground">
                      Engagement
                    </div>
                  </div>

                  <div
                    className="relative w-full min-w-[1180px]"
                    style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                  >
                    {virtualRows.map((virtualRow) => {
                      const person = people[virtualRow.index];

                      if (!person) {
                        return null;
                      }

                      return (
                        <CustomerListRow
                          key={person.id}
                          person={person}
                          isSelected={selectedPerson?.id === person.id}
                          onSelect={handleSelect}
                          measureElement={rowVirtualizer.measureElement}
                          start={virtualRow.start}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div className="py-4 flex justify-center w-full">
                  <Loader2
                    className={cn(
                      "w-5 h-5 text-muted-foreground",
                      isFetchingNext && "animate-spin",
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detail Panel - Animated Slide In */}
        {!showDuplicates && (
          <div
            className={cn(
              "border-l bg-card transition-all duration-300 ease-in-out flex flex-col overflow-hidden shadow-xl z-20",
              isDetailPanelOpen
                ? "w-[450px] translate-x-0"
                : "w-0 translate-x-[20px] opacity-0",
            )}
          >
            {selectedPerson && (
              <div className="w-[450px] h-full">
                <CustomerDetailPanel
                  person={selectedPerson}
                  wid={wid}
                  onEdit={handleEdit}
                  onClose={handleCloseDetailPanel}
                  onPersonUpdated={(updatedPerson) =>
                    setSelectedPerson(updatedPerson)
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <CustomerFormModal
        isOpen={isEditFormOpen || isAddCustomerOpen}
        onClose={handleCloseFormModal}
        person={selectedPerson}
        wid={wid}
        mode={isAddCustomerOpen ? "create" : "edit"}
      />
    </div>
  );
}

const getEngagementStatus = (person: IPerson): string => {
  const conversationCount = person.pastSessionIds?.length || 0;

  // Check if created recently (within last 7 days) and has only 1 conversation
  if (conversationCount === 1 && person.createdAt) {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(person.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSinceCreated <= 7) {
      return "New";
    }
  }

  return conversationCount === 1
    ? "1 conversation"
    : `${conversationCount} conversations`;
};

const getChannelLabel = (provider: IChannelProvider | string) => {
  switch (provider) {
    case "whatsapp":
      return "WhatsApp";
    case "instagram":
      return "Instagram";
    case "messenger":
      return "Messenger";
    case "slack":
      return "Slack";
    case "email":
      return "Email";
    case "web":
      return "Web";
    default:
      return fromSlug(provider);
  }
};

const CustomersTableSkeleton = () => {
  return (
    <table className="w-full caption-bottom text-sm">
      <TableHeader className="bg-secondary sticky top-0 z-10 border-b">
        <TableRow className="hover:bg-transparent border-b w-full">
          <TableHead className="w-[300px] pl-6">Name</TableHead>
          <TableHead className="w-[200px]">Contact</TableHead>
          <TableHead className="w-[200px]">Company</TableHead>
          <TableHead className="w-[200px]">Tags</TableHead>
          <TableHead className="w-[150px] text-right pr-6">
            Engagement
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell className="pl-6 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </TableCell>
            <TableCell className="text-right pr-6">
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-3 w-[80px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
};
