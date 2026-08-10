"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackgroundMusicStyleEditorProps {
  reelId: string;
  initialStyle: string;
}

export function BackgroundMusicStyleEditor({
  reelId,
  initialStyle,
}: BackgroundMusicStyleEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialStyle);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(initialStyle);
    setSaved(false);
  }, [initialStyle]);

  const cancelEditing = () => {
    setIsEditing(false);
    setValue(initialStyle);
    setError(null);
    setSaved(false);
  };

  const saveStyle = async () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError("Please enter a background music style.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/client/reel-bg-music", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId, styleDescription: trimmedValue }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to update background music style.");
      }

      setValue(trimmedValue);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update background music style.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Style
        </p>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
              <Check className="size-3" />
              Saved
            </span>
          )}
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setError(null);
                setSaved(false);
              }}
              className="cursor-pointer rounded-md p-1.5 text-muted-foreground/70 transition hover:bg-background hover:text-primary"
              title="Edit background music style"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            disabled={isSaving}
            className="min-h-[90px] w-full resize-y rounded-lg border border-primary/30 bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            placeholder="Describe the background music style…"
            autoFocus
          />

          {error && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-destructive">
              <AlertTriangle className="size-3 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSaving}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-60"
            >
              <X className="size-3" />
              Cancel
            </button>
            <button
              type="button"
              onClick={saveStyle}
              disabled={isSaving || !value.trim()}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-3" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-snug text-foreground/80">
          {value || "No style description yet."}
        </p>
      )}
    </div>
  );
}
