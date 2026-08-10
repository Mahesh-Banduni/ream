"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Bell,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Activity,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import {useSession} from "next-auth/react";

const adminNavItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    badge: "Live",
    description: "Analytics & KPIs",
  },
  {
    href: "/admin/client",
    label: "Clients",
    icon: Users,
    badge: null,
    description: "Manage accounts",
  },
];

export function AdminAreaShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {data: session} = useSession();

  const activeNavItem = adminNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/70 bg-sidebar">
          {/* Brand Header */}
          <div className="flex items-center justify-center relative h-[100px] w-full border-b border-border/60 px-6">
            <Link href="/admin/dashboard" className="relative w-[160px] h-full flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="REAM Admin"
                fill
                className="object-contain p-2"
                priority
              />
            </Link>
          </div>

          {/* Admin Badge Strip */}
          {/* <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              Admin Portal
            </span>
            <span className="ml-auto flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Live</span>
            </span>
          </div> */}

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Main Menu
            </p>
            {adminNavItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 relative",
                    active
                      ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                      : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                  )}
                >
                  
                    <Icon className="size-4" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate leading-tight">{item.label}</p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border/60">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="grid size-6 place-items-center rounded-lg bg-primary/15">
                  <Sparkles className="size-3.5 text-primary" />
                </div>
                <p className="text-xs font-bold text-foreground">Admin System</p>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Manage accounts, monitor analytics, and toggle client access.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Activity className="size-3 text-emerald-500" />
                <span>System Operational</span>
                <span className="ml-auto font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60">v2.4</span>
              </div>
            </div>
            <div className="mt-3">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Mobile Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-sidebar border-r border-border h-full flex flex-col shadow-2xl z-10">
              {/* Mobile Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
                <div className="relative h-15 w-28">
                  <Image src="/images/logo.png" alt="REAM" fill className="object-contain" priority />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Mobile Admin Badge */}
              {/* <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Admin Controls</span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse ml-auto" />
              </div> */}

              {/* Mobile Nav */}
              <nav className="mt-3 flex-1 px-3 space-y-1">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Navigation
                </p>
                {adminNavItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                        active
                          ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                      )}
                    >
                        <Icon className="size-4" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{item.label}</p>
                        {/* <p className="text-[10px] text-muted-foreground/70">{item.description}</p> */}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-border/60 p-3">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header Bar */}
          <header className="h-16 shrink-0 border-b border-border/70 bg-card/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 z-10 sticky top-0">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-border bg-background text-foreground hover:bg-accent transition-colors"
              >
                <Menu className="size-5" />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline">Admin</span>
                <ChevronRight className="size-4 text-muted-foreground/60 hidden sm:inline" />
                <span className="text-foreground font-semibold">{activeNavItem?.label || "Dashboard"}</span>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Search mock */}
              {/* <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/70 bg-muted/30 text-muted-foreground text-xs font-medium cursor-pointer hover:bg-muted/50 transition-colors">
                <Search className="size-3.5" />
                <span>Search...</span>
                <kbd className="ml-2 text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
              </div> */}

              <ThemeToggle />

              {/* Notification Bell */}
              <button
                title="Notifications"
                className="relative p-2 rounded-xl border border-border/70 bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary animate-pulse" />
              </button>

              <div className="h-5 w-px bg-border/80 mx-0.5 hidden sm:block" />

              {/* Admin Avatar */}
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-md ring-2 ring-primary/20">
                    {`${session?.user?.name?.charAt(0).toUpperCase() ?? "U"}`}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-tight text-foreground">{session?.user?.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{session?.user?.email}</p>
                  </div>
                </div>
            </div>
          </header>

          {/* Main Viewport */}
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 bg-background/40">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
