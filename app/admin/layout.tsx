import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminAreaShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "REAM Admin - Dashboard & Management",
  description: "Admin panel to manage clients, view analytics, and control system operations.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAreaShell>{children}</AdminAreaShell>;
}
