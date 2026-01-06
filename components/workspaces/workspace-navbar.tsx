"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@/lib/hooks/auth/use-auth-actions";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { cn } from "@/lib/utils";

export const WorkspacesNavbar = () => {
  const { user } = useCurrentUser();
  const { signOutUser } = useAuthActions();
  const pathname = usePathname();

  const getInitials = (name?: string, email?: string) => {
    if (name)
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  const navLinks = [
    { href: "/workspaces", label: "Workspaces" },
    { href: "/billing", label: "Billing" },
  ];

  return (
    <nav className="w-full bg-background/80 backdrop-blur-md border-b fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto py-2 px-4 pr-2 md:px-3 lg:px-3 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Magical CX Home"
          tabIndex={0}
          className="relative inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="font-medium text-base text-primary tracking-tight">
            Magical CX
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                tabIndex={0}
                className={cn(
                  "transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                  aria-label="User menu"
                  tabIndex={0}
                >
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage
                      src={user.photoUrl}
                      alt={user.name || user.email}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium">
                    {user.name || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOutUser.mutate()}
                  disabled={signOutUser.isPending}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {signOutUser.isPending ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};
