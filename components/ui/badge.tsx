import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "muted" | "outline" | "success" | "warning" | "destructive";

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  muted: "border-border bg-muted text-muted-foreground",
  outline: "border-border bg-transparent text-foreground",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
  destructive: "border-red-500/20 bg-red-500/10 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
