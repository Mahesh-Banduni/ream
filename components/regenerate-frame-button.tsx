"use client";

import { useState, useRef, useEffect } from "react";
import {
  RefreshCw,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Mic,
  ImageIcon,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useRegenerateFrame, RegenerateMode } from "@/app/hooks/use-regenerate-frame";

interface RegenerateOption {
  mode: RegenerateMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const OPTIONS: RegenerateOption[] = [
  {
    mode: "everything",
    label: "Everything",
    description: "Script, voice & image",
    icon: LayoutGrid,
  },
  {
    mode: "voice_only",
    label: "Voice Only",
    description: "Re-generate voiceover audio",
    icon: Mic,
  },
  {
    mode: "image_only",
    label: "Image Only",
    description: "Re-generate frame image",
    icon: ImageIcon,
  },
];

interface Props {
  reelId: string;
  frameId: string;
}

export function RegenerateFrameButton({ reelId, frameId }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { status, activeMode, errorMsg, handleRegenerate } = useRegenerateFrame({
    reelId,
    frameId,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSelectMode = async (mode: RegenerateMode) => {
    setOpen(false);
    await handleRegenerate(mode);
  };


  const isLoading = status === "loading";

  return (
    <div
      className="relative inline-flex shrink-0"
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Split button ── left part: icon + label / right part: chevron */}
      <button
        disabled={isLoading}
        onClick={() => !isLoading && setOpen((o) => !o)}
        className={`
          cursor-pointer inline-flex items-center gap-1.5 rounded-lg border text-xs font-medium
          px-2.5 py-1.5 transition-all duration-200 select-none
          ${status === "success"
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : status === "error"
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5 text-foreground/80 hover:text-primary"
          }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
        title="Regenerate frame"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {/* Status icon */}
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
          {isLoading && activeMode
            ? `Regenerating ${OPTIONS.find((o) => o.mode === activeMode)?.label ?? ""}…`
            : status === "success"
              ? "Done!"
              : status === "error"
                ? (errorMsg ?? "Failed")
                : "Regenerate Frame"}
        </span>

        {!isLoading && (
          <ChevronDown
            className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && !isLoading && (
        <div
          role="menu"
          className="
            absolute right-0 top-full z-[9999] mt-1.5
            min-w-[230px] origin-top-right
            rounded-xl border border-border/60 bg-popover
            shadow-xl shadow-black/10 dark:shadow-black/30
            ring-1 ring-black/5 dark:ring-white/5
            animate-in fade-in-0 zoom-in-95 duration-150
          "
        >
          <div className="p-1.5 space-y-0.5">
            <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              What to regenerate
            </p>
            {OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.mode}
                  role="menuitem"
                  onClick={() => onSelectMode(opt.mode)}
                  className="
                    cursor-pointer w-full flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-left text-sm transition-colors duration-150
                    hover:bg-accent hover:text-accent-foreground
                    focus:outline-none focus:bg-accent focus:text-accent-foreground
                    group
                  "
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-foreground text-xs leading-tight">
                      {opt.label}
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      {opt.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
