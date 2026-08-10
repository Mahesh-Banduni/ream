"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Film,
  FileText,
  Sparkles,
  Clock3,
  GripVertical,
  Pencil,
  Save,
  X,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FrameAssets } from "@/components/frame-assets";
import { RegenerateFrameButton } from "@/components/regenerate-frame-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ─── Types (mirroring admin-data types used by the reel detail page) ────────
type AssetStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface FrameImage {
  id: string;
  prompt: string;
  imageUrl: string | null;
  processingStatus: AssetStatus;
  createdAt: string;
}

interface FrameVoice {
  id: string;
  language: string;
  audioUrl: string | null;
  processingStatus: AssetStatus;
  createdAt: string;
}

interface FrameVideo {
  id: string;
  prompt: string;
  videoUrl: string | null;
  processingStatus: AssetStatus;
  createdAt: string;
}

interface ReelFrame {
  id: string;
  orderId: number;
  narration: string;
  visualDescription: string;
  startTime: number;
  endTime: number;
  imageCount: number;
  voiceCount: number;
  videoCount: number;
  images: FrameImage[];
  voices: FrameVoice[];
  videos: FrameVideo[];
}

interface ReelFramesListProps {
  reelId: string;
  frames: ReelFrame[];
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
}

// ─── Main component ─────────────────────────────────────────────────────────
export function ReelFramesList({ reelId, frames: initialFrames }: ReelFramesListProps) {
  const [frames, setFrames] = useState<ReelFrame[]>(initialFrames);

  useEffect(() => {
    setFrames(initialFrames);
  }, [initialFrames, reelId]);

  // ─── Drag & Drop state ──────────────────────────────────────────────────
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // ─── Narration editing state ────────────────────────────────────────────
  const [editingFrameId, setEditingFrameId] = useState<string | null>(null);
  const [editedNarration, setEditedNarration] = useState("");
  const [isSavingNarration, setIsSavingNarration] = useState(false);
  const [narrationSavedId, setNarrationSavedId] = useState<string | null>(null);
  const [narrationError, setNarrationError] = useState<string | null>(null);

  const dragItemRef = useRef<number | null>(null);

  // ─── Drag handlers ──────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragItemRef.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Set a transparent drag image to avoid the browser's default
    const ghost = document.createElement("div");
    ghost.style.opacity = "0";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const fromIndex = dragItemRef.current;
      if (fromIndex === null || fromIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      // Reorder in local state
      const updated = [...frames];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(dropIndex, 0, moved);

      // Reassign orderIds sequentially starting from 1
      let currentStart = 0;

      const reordered = updated.map((frame, idx) => {
        const duration = frame.endTime - frame.startTime;
      
        const newFrame = {
          ...frame,
          orderId: idx + 1,
          startTime: currentStart,
          endTime: currentStart + duration,
        };
      
        currentStart += duration;
      
        return newFrame;
      });

      setFrames(reordered);
      setDraggedIndex(null);
      setDragOverIndex(null);

      // Persist to server
      await saveFrameOrder(reordered);
    },
    [frames]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const saveFrameOrder = async (reordered: ReelFrame[]) => {
    setIsSavingOrder(true);
    setOrderSaved(false);
    setOrderError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
      const res = await fetch(`${baseUrl}/api/client/reel-frame/${reelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: reordered.map((f) => ({
            id: f.id,
            orderId: f.orderId,
            startTime: f.startTime,
            endTime: f.endTime,
            narration: f.narration,
            visualDescription: f.visualDescription,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save frame order.");

      setOrderSaved(true);
      setTimeout(() => setOrderSaved(false), 2500);
    } catch (err: any) {
      setOrderError(err.message || "Failed to save frame order.");
      setTimeout(() => setOrderError(null), 4000);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ─── Narration edit handlers ────────────────────────────────────────────
  const startEditing = (frame: ReelFrame) => {
    setEditingFrameId(frame.id);
    setEditedNarration(frame.narration);
    setNarrationError(null);
    setNarrationSavedId(null);
  };

  const cancelEditing = () => {
    setEditingFrameId(null);
    setEditedNarration("");
    setNarrationError(null);
  };

  const saveNarration = async (frame: ReelFrame) => {
    if (editedNarration.trim() === frame.narration) {
      cancelEditing();
      return;
    }

    setIsSavingNarration(true);
    setNarrationError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
      const res = await fetch(`${baseUrl}/api/client/reel-frame/${reelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: [
            {
              id: frame.id,
              narration: editedNarration.trim(),
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed to save narration.");

      // Update local state
      setFrames((prev) =>
        prev.map((f) =>
          f.id === frame.id ? { ...f, narration: editedNarration.trim() } : f
        )
      );

      setEditingFrameId(null);
      setEditedNarration("");
      setNarrationSavedId(frame.id);
      setTimeout(() => setNarrationSavedId(null), 2500);
    } catch (err: any) {
      setNarrationError(err.message || "Failed to save narration.");
    } finally {
      setIsSavingNarration(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Order save status bar */}
      <div className="flex items-center justify-between min-h-[28px]">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <GripVertical className="size-3 opacity-50" />
          Drag frames to reorder
        </p>
        <div className="flex items-center gap-2">
          {isSavingOrder && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="size-3 animate-spin" />
              Updating reel order…
            </span>
          )}
          {orderSaved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-in fade-in duration-300">
              <Check className="size-3.5" />
              Reel Order Updated
            </span>
          )}
          {orderError && (
            <span className="flex items-center gap-1.5 text-xs text-destructive font-medium animate-in fade-in duration-300">
              <AlertTriangle className="size-3.5" />
              {orderError}
            </span>
          )}
        </div>
      </div>

      <Accordion className="space-y-4">
        {frames.map((frame, index) => {
          const isDragged = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;
          const isEditing = editingFrameId === frame.id;
          const justSaved = narrationSavedId === frame.id;

          return (
            <div
              key={frame.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-200 rounded-2xl ${
                isDragged
                  ? "opacity-40 scale-[0.98]"
                  : isDragOver
                  ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                  : ""
              }`}
            >
              <AccordionItem
                value={`frame-${frame.id}`}
                className="rounded-2xl border border-border/60 bg-muted/10 px-5"
              >
                {/* Flex row: drag handle + trigger + regenerate button */}
                <div className="flex items-center justify-between gap-2 pr-2">
                  {/* Drag Handle */}
                  <div
                    className="flex items-center justify-center px-1 py-3 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    title="Drag to reorder"
                  >
                    <GripVertical className="size-4" />
                  </div>

                  <AccordionTrigger className="hover:no-underline py-5 cursor-pointer flex-1 min-w-0 w-full!">
                    <div className="flex flex-col md:flex-row w-full items-center justify-between pr-2 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                          {frame.orderId}
                        </span>
                        <span className="font-semibold">
                          Frame {frame.orderId}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        <Clock3 className="mr-1 h-3.5 w-3.5" />
                        {formatTime(frame.startTime)} →{" "}
                        {formatTime(frame.endTime)}
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <RegenerateFrameButton
                    reelId={reelId}
                    frameId={frame.id}
                  />
                </div>

                <AccordionContent className="pb-5">
                  <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left */}
                    <div className="space-y-4 lg:col-span-5">
                      {/* Narration — editable */}
                      <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <FileText className="h-3.5 w-3.5 text-primary/80" />
                            Narration / Voiceover Script
                          </h4>
                          <div className="flex items-center gap-1">
                            {justSaved && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium animate-in fade-in duration-300">
                                <Check className="size-3" />
                                Saved
                              </span>
                            )}
                            {!isEditing && (
                              <button
                                onClick={() => startEditing(frame)}
                                className="cursor-pointer rounded-md p-1.5 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                                title="Edit narration"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <textarea
                              value={editedNarration}
                              onChange={(e) => setEditedNarration(e.target.value)}
                              disabled={isSavingNarration}
                              rows={4}
                              className="w-full rounded-lg border border-primary/30 bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-y min-h-[80px] disabled:opacity-50"
                              placeholder="Enter the narration for this frame…"
                              autoFocus
                            />

                            {narrationError && (
                              <p className="flex items-center gap-1 text-[11px] text-destructive font-medium">
                                <AlertTriangle className="size-3 shrink-0" />
                                {narrationError}
                              </p>
                            )}

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={isSavingNarration}
                                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 disabled:opacity-50"
                              >
                                <X className="size-3" />
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => saveNarration(frame)}
                                disabled={isSavingNarration || !editedNarration.trim()}
                                className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
                              >
                                {isSavingNarration ? (
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
                          <blockquote className="border-l-2 border-primary/50 pl-3 italic">
                            &ldquo;{frame.narration}&rdquo;
                          </blockquote>
                        )}
                      </div>

                      <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5 text-primary/80" />
                          Visual Description
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {frame.visualDescription ||
                            "No prompt details configured."}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="rounded-xl border border-border/45 bg-card/40 p-4 lg:col-span-7">
                      <FrameAssets
                        images={frame.images}
                        voices={frame.voices}
                        videos={frame.videos}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>
    </div>
  );
}
