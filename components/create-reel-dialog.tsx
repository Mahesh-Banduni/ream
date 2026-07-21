"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Film, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReel } from "@/app/hooks/useReel";

export function CreateReelDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [durationOption, setDurationOption] = useState("30");
  const [customDuration, setCustomDuration] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {createReel, generateReelScript, generateFrameAssets} = useReel();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const resetForm = () => {
    setTitle("");
    setAudience("");
    setDurationOption("30");
    setCustomDuration("");
    setError(null);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client-side validation
    if (!title.trim()) {
      setError("Please enter a title for the reel.");
      return;
    }

    if (!audience.trim()) {
      setError("Please specify the intended audience.");
      return;
    }

    let finalDuration = 30;
    if (durationOption === "custom") {
      const parsed = parseInt(customDuration, 10);
      if (isNaN(parsed) || parsed <= 0) {
        setError("Please enter a valid positive number of seconds for duration.");
        return;
      }
      finalDuration = parsed;
    } else {
      finalDuration = parseInt(durationOption, 10);
    }

    setIsSubmitting(true);

    try {
      const result = await createReel({title, audience, durationSeconds: finalDuration});

      const res = await generateReelScript(result.id);
      const response = await generateFrameAssets(result.id);

      // Close modal and redirect to new reel page
      setIsOpen(false);
      router.push(`/admin/reels/${result.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create reel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // The modal overlay and content rendered inside the portal
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xs transition-all duration-300">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200 transform scale-100 max-h-[90vh] flex flex-col z-10"
      >
        {/* Gradient Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Film className="size-5 text-primary" />
              Create New Reel
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Specify the details to initiate your short-form video generation pipeline.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-5 overflow-y-auto flex-1 pr-1 no-scrollbar">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Film className="size-3.5 text-muted-foreground" />
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="e.g. 5 Coding Mistakes to Avoid"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              required
            />
          </div>

          {/* Intended Audience Input */}
          <div className="space-y-1.5">
            <label htmlFor="audience" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-muted-foreground" />
              Intended Audience
            </label>
            <input
              type="text"
              id="audience"
              placeholder="e.g. Junior Web Developers, Students"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              required
            />
          </div>

          {/* Duration Options */}
          <div className="space-y-1.5">
            <label htmlFor="duration" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              Duration
            </label>
            <Select
              value={durationOption}
              onValueChange={(val) => setDurationOption(val || "30")}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full h-10 rounded-xl bg-muted/20 border border-border px-3.5 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 flex items-center justify-between">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="w-full max-w-[calc(100vw-2rem)] border border-border bg-card shadow-2xl p-1 rounded-xl">
                <SelectItem value="30">30 seconds (standard short)</SelectItem>
                <SelectItem value="45">45 seconds (mid-length short)</SelectItem>
                <SelectItem value="60">60 seconds (max-length short)</SelectItem>
                <SelectItem value="custom">Custom duration...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Duration Input (Conditional) */}
          {durationOption === "custom" && (
            <div className="space-y-1.5 pl-3 border-l-2 border-primary/40 animate-in slide-in-from-top-2 duration-200">
              <label htmlFor="custom-duration" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                Custom Duration (seconds)
              </label>
              <input
                type="number"
                id="custom-duration"
                min="1"
                placeholder="Enter custom duration in seconds"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Reel"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpen}
        className="reelbtn gap-2 border-border/80 bg-background hover:bg-muted text-foreground transition-all duration-200"
      >
        <Plus className="size-4" />
        Add New Reel
      </Button>

      {mounted && typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
