"use client";

import {
  usePeople,
  useAllIdenticalPersons,
} from "@/lib/hooks/people/use-people";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Filter,
  MoreHorizontal,
  Calendar,
  Globe,
  MessageCircleCode,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { IPerson } from "@/lib/types/person";
import CustomerEditForm from "@/components/customers/customer-edit-form";
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
import { formatDistanceToNow } from "date-fns";
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

export default function CustomersPage() {
  const { wid } = useParams() as { wid: string };
  const { people, hasMore, loadMore, nPeople, isLoading } = usePeople(wid);
  const { data: identicalPersons = [] } = useAllIdenticalPersons(wid);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // Intersection Observer for Infinite Scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadMore]);

  const handleSelect = (person: IPerson) => {
    if (selectedPerson?.id === person.id && isDetailPanelOpen) {
      setIsDetailPanelOpen(false);
      setTimeout(() => setSelectedPerson(null), 200); // Wait for animation
    } else {
      setSelectedPerson(person);
      setIsDetailPanelOpen(true);
    }
  };

  const handleEdit = (person: IPerson) => {
    setSelectedPerson(person);
    setIsEditFormOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setTimeout(() => setSelectedPerson(null), 200);
  };

  const filteredPeople = people.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.emails?.some((e) => e.value.toLowerCase().includes(q)) ||
      p.phones?.some((ph) => ph.value.includes(q)) ||
      p.company?.toLowerCase().includes(q)
    );
  });
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
    const providers = Array.from(
      new Set(
        (person.externalIds || []).map((e) => e.provider).filter(Boolean),
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
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={showDuplicates ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDuplicates(!showDuplicates)}
            className="h-8 relative"
          >
            <Filter className="w-4 h-4 " />
            Identical Persons
            {identicalPersons.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded-full bg-background/20">
                {Math.floor(identicalPersons.length / 2)}
              </span>
            )}
          </Button>
          <div className="relative w-64 ">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9 h-8  bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
            <div className="flex-1 overflow-auto relative">
              {isLoading && people.length === 0 ? (
                <CustomersTableSkeleton />
              ) : filteredPeople.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4 ring-8 ring-secondary/20">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No customers found
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    We couldn't find any customers matching "{searchQuery}". Try
                    adjusting your search or filters.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <table className="w-full caption-bottom text-sm">
                  <TableHeader className="bg-secondary sticky top-0 z-10 border-b">
                    <TableRow className="hover:bg-transparent border-b w-full">
                      <TableHead className="w-[300px] pl-6">Name</TableHead>
                      <TableHead className="w-[130px]"></TableHead>
                      <TableHead className="w-[200px]">Contact</TableHead>
                      <TableHead className="w-[200px]">Company</TableHead>
                      <TableHead className="w-[200px]">Tags</TableHead>
                      <TableHead className="w-[150px] text-right pr-6">
                        Engagement
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPeople.map((person) => (
                      <TableRow
                        key={person.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/80",
                          selectedPerson?.id === person.id && "bg-muted",
                        )}
                        onClick={() => handleSelect(person)}
                      >
                        <TableCell className="pl-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border/40">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {getInitials(person.name || "?")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate text-sm text-foreground">
                                {person.name || "Unknown"}
                              </span>
                              {person.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">
                                    {person.location}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pl-6 py-3">
                          {" "}
                          <ChannelAvatarStack person={person} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {person.emails?.[0] ? (
                              <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="truncate max-w-[180px]">
                                  {person.emails[0].value}
                                </span>
                              </div>
                            ) : null}
                            {person.phones?.[0] ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span className="truncate">
                                  {person.phones[0].value}
                                </span>
                              </div>
                            ) : null}
                            {!person.emails?.[0] && !person.phones?.[0] && (
                              <span className="text-xs text-muted-foreground italic">
                                No contact info
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {person.company ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-[150px]">
                                {person.company}
                              </span>
                              {person.title && (
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {person.title}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {person.tags?.slice(0, 2).map((tag, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] font-medium h-5 bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border/50"
                              >
                                {fromSlug(tag)}
                              </Badge>
                            ))}
                            {person.tags && person.tags.length > 2 && (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[10px] h-5"
                              >
                                +{person.tags.length - 2}
                              </Badge>
                            )}
                            {!person.tags?.length && (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-medium text-foreground/80">
                              {getEngagementStatus(person)}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(person.createdAt) || "-"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div
                  ref={observerTarget}
                  className="py-4 flex justify-center w-full"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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
            <div className="w-[450px] h-full">
              {" "}
              {/* Fixed width container to prevent content squishing during transition */}
              <CustomerDetailPanel
                person={selectedPerson}
                onEdit={handleEdit}
                onClose={handleCloseDetailPanel}
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <CustomerEditForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        person={selectedPerson}
        wid={wid}
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
