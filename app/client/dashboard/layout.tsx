import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "REAM - Dashboard",
  description: "Dashboard for managing reels and generated assets.",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

import { AdminShell } from "@/components/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
