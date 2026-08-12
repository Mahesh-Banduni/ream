"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      onClick={() => {signOut({ callbackUrl: "/auth/signin" });window.location.reload();}}
      className={cn("w-full h-11! justify-start gap-3 px-4 py-3 text-sm font-medium", className)}
    >
      <LogOut className="size-4" />
      <span>Logout</span>
    </Button>
  );
}
