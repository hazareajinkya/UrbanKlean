"use client";
import { useWorkspace } from "@/lib/hooks/workspace/use-workspace";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Users,
  LogOut,
  Zap,
  Menu,
  X,
  ChartColumnIncreasing,
  Waves,
  Book,
  ChevronRight,
  ChevronLeft,
  Rss,
  Settings2,
} from "lucide-react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import UserProfileModal from "@/components/user/user-profile-modal";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { wid } = useParams() as { wid: string };
  const { workspace, isLoading } = useWorkspace(wid);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <WorkspaceSidebar
        workspace={workspace}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text- font-mdium">{workspace?.name || "Workspace"}</h1>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: ChartColumnIncreasing,
  },

  {
    title: "Knowledge Base",
    href: "/knowledge",
    icon: Book,
  },
  {
    title: "Agents",
    href: "/agents",
    icon: Waves,
  },
  {
    title: "Channels",
    href: "/channels",
    icon: Rss,
  },
  {
    title: "Actions",
    href: "/actions",
    icon: Zap,
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings2,
  },
];

interface WorkspaceSidebarProps {
  workspace: any;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const WorkspaceSidebar = ({ isOpen, onClose }: WorkspaceSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { wid } = useParams() as { wid: string };
  const { user } = useCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModelOpen] = useState(false);

  const handleSignOut = () => {
    router.push("/auth");
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const handleModalOpen = () => {
    setIsModelOpen(true);
  };
  const handleModalClose = () => {
    setIsModelOpen(false);
  };
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-10 bg-card border-r border-border
        flex flex-col transform transition-all duration-200 ease-in-out lg:translate-x-0
        ${isCollapsed ? "w-16" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 h-12 border-b border-border">
        <Link
          href="/workspaces"
          className="px-4  flex justify-between items-center gap-1 min-w-0 flex-1"
        >
          {!isCollapsed && (
            <>
              <h2 className="font-medium truncate">Magical CX</h2>
              <img
                src={"/temp-logo-transparent.png"}
                // src="https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/w%2Fe846a44e-988d-492a-ac46-629fd479ae5b%2Fagents%2F94fbefb7-df52-438c-8a86-de1ef901ff49%2Flogo?alt=media&token=7c7a28ec-362e-4a54-a64b-6adcec4a07e6"
                className="size-7 rounded-md"
              />
            </>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/w%2Fe846a44e-988d-492a-ac46-629fd479ae5b%2Fagents%2F94fbefb7-df52-438c-8a86-de1ef901ff49%2Flogo?alt=media&token=7c7a28ec-362e-4a54-a64b-6adcec4a07e6"
                className="w-6 h-6 rounded-md"
              />
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="lg:hidden h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <nav className={`${isCollapsed ? "space-y-2" : "space-y-1"}`}>
          {navigation.map((item) => {
            const href = `/workspaces/${wid}${item.href}`;
            const isActive = pathname.includes(href);

            return (
              <Link
                key={item.title}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center rounded-lg text-sm font-medium gap-3 px-3 py-2
                  transition-colors duration-200 hover:bg-accent hover:text-primary
                  ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-neutral-600 -foreground hover:text-primary"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${
                    isCollapsed ? "h-4.5 w-4.5" : ""
                  }`}
                />
                {!isCollapsed && (
                  <span className="line-clamp-1 overflow-hidden truncate">
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapse}
          className={`
            w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/50 
            transition-colors duration-200 text-muted-foreground hover:text-primary
            ${isCollapsed ? "justify-center" : "justify-between"}
          `}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!isCollapsed && <span className="text-sm">Collapse</span>}
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div
          className={`
          flex items-center rounded-lg hover:bg-accent/50 transition-colors duration-200 gap-3 w-full
          ${isCollapsed ? "justify-center" : ""}
        `}
        >
          <div
            className={`flex items-center gap-3 ${
              !isCollapsed && "flex-1"
            } min-w-0 cursor-pointer`}
            onClick={handleModalOpen}
          >
            <Avatar className="h-8 w-8 ring-2 ring-border shrink-0">
              <AvatarImage src={user?.photoUrl} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <UserProfileModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={user}
      />
    </aside>
  );
};
