import type { TableHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: TableHTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-border/60 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/60",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: TableHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TableHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-4 align-middle", className)} {...props} />;
}
