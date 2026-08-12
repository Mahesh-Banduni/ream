"use client";

import { useRef, useEffect } from "react";
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Music2,
} from "lucide-react";
import { useRegenerateBgMusic } from "@/app/hooks/use-regenerate-bg-music";

interface Props {
  reelId: string;
}

export function RegenerateBgMusicButton({ reelId }: Props) {
  const { status, errorMsg, regenerate } = useRegenerateBgMusic(reelId);
  const isLoading = status === "loading";

  return (
    <button
      disabled={isLoading}
      onClick={regenerate}
      className={`
        cursor-pointer inline-flex items-center gap-1.5 rounded-lg border text-xs font-medium
        px-2.5 py-1.5 transition-all duration-200 select-none shrink-0
        ${
          status === "success"
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : status === "error"
            ? "border-destructive/50 bg-destructive/10 text-destructive"
            : "border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5 text-foreground/80 hover:text-primary"
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
      title={errorMsg ?? "Regenerate background music"}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : status === "success" ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      ) : status === "error" ? (
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5 shrink-0" />
      )}

      <span className="hidden sm:inline whitespace-nowrap">
        {isLoading
          ? "Regenerating…"
          : status === "success"
          ? "Done!"
          : status === "error"
          ? (errorMsg ?? "Failed")
          : "Regenerate Music"}
      </span>
    </button>
  );
}
