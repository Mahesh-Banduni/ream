"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3,
  Clapperboard,
  Bell,
  Settings,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {useSession} from "next-auth/react";

const navItems = [
  {
    href: "/client/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/client/dashboard/reels",
    label: "Reels",
    icon: Clapperboard,
  }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="h-screen bg-background">
      <div className="mx-auto flex h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-sidebar lg:flex items-center">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center justify-center relative h-[120px] w-[180px] border-b border-border/60 px-5">
            <Image
              src="/images/logo.png"
              alt="REAM"
              fill
              className="object-contain p-1 w-full"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="w-full flex flex-1 flex-col gap-1 px-3 py-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Navigation
            </p>
            {navItems.map((item) => {
              const active =
                pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                      : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                  )}
                >
                    <Icon className="size-4" />
                  {/* </div> */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{item.label}</p>
                  </div>
                  {/* {active && <ChevronRight className="size-3.5 shrink-0 text-primary/60" />} */}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-border/60 p-4 space-y-3 w-full">
            {/* Theme Toggle Row */}
            {/* <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold text-foreground">Appearance</p>
                <p className="text-xs text-muted-foreground">Toggle light / dark</p>
              </div>
              <ThemeToggle />
            </div> */}

            {/* Pro Tip */}
            {/* <div className="rounded-xl border border-primary/15 bg-primary/6 p-3">
              <div className="flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="size-3.5" />
                </div>
                <p className="text-xs font-semibold text-foreground">Pro tip</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Orange badges indicate active AI processing jobs in the pipeline.
              </p>
            </div> */}
            <LogoutButton />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex h-screen min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border/80 bg-card/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center justify-between gap-4">
              {/* Breadcrumb / Title area */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {navItems.find(
                      (n) =>
                        pathname === n.href || pathname.startsWith(`${n.href}/`)
                    )?.label ?? "Dashboard"}
                  </p>
                </div>
                {/* Mobile: logo */}
                <div className="flex items-center gap-2 lg:hidden">
                  <Link href="/" className="w-18 md:w-26 h-14 md:h-20 flex items-center justify-center relative px-5">
                    <Image
                      src="/images/logo.png"
                      alt="REAM"
                      fill
                      className="object-contain w-full"
                      priority
                    />
                  </Link>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button className="cursor-pointer grid size-8 place-items-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Bell className="size-4" />
                </button>
                <button className="cursor-pointer grid size-8 place-items-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Settings className="size-4" />
                </button>
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
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
