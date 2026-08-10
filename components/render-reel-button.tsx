"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type RenderState = "idle" | "loading" | "success" | "error";

interface RenderReelButtonProps {
  reelId: string;
  className?: string;
}

export function RenderReelButton({ reelId, className }: RenderReelButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<RenderState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRender = async () => {
    if (state === "loading") return;

    setState("loading");
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/client/reels/${reelId}/render`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Render failed");
      }

      setState("success");
      // Refresh the page to show the new video
      setTimeout(() => {
        router.refresh();
        setState("idle");
      }, 2000);
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
      setTimeout(() => setState("idle"), 4000);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={handleRender}
        disabled={state === "loading" || state === "success"}
        className={cn(
          "cursor-pointer flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
          state === "idle" &&
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
          state === "loading" &&
            "bg-primary/70 text-primary-foreground cursor-not-allowed",
          state === "success" &&
            "bg-emerald-500 text-white cursor-not-allowed",
          state === "error" &&
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          className
        )}
      >
        {state === "loading" && <Loader2 className="size-4 animate-spin" />}
        {state === "success" && <CheckCircle2 className="size-4" />}
        {state === "error" && <AlertTriangle className="size-4" />}
        {state === "idle" && <Clapperboard className="size-4" />}
        {state === "idle" && "Assemble & Render Reel"}
        {state === "loading" && "Rendering... (this may take a while)"}
        {state === "success" && "Render complete! Refreshing…"}
        {state === "error" && "Retry Render"}
      </button>

      {state === "error" && errorMessage && (
        <p className="text-xs text-destructive font-medium px-1">
          Error: {errorMessage}
        </p>
      )}
    </div>
  );
}
