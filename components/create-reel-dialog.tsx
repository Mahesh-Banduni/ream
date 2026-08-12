"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Film, Users, Clock, Sparkles, Tag, Mic, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReel } from "@/app/hooks/useReel";

const KEYWORD_SUGGESTIONS = [
  "Viral",
  "Tips & Tricks",
  "AI & Automation",
  "Coding",
  "Growth",
  "Productivity",
  "Tech",
  "Storytelling",
];

const VOICE_OPTIONS = [
  { id: "aditya", name: "Aditya", gender: "Male", style: "Confident & Professional" },
  { id: "shubh", name: "Shubh", gender: "Male", style: "Professional & Clear" },
  { id: "ratan", name: "Ratan", gender: "Male", style: "Deep & Authoritative" },
  { id: "rahul", name: "Rahul", gender: "Male", style: "Conversational & Natural" },
  { id: "varun", name: "Varun", gender: "Male", style: "Warm & Friendly" },
  { id: "kabir", name: "Kabir", gender: "Male", style: "Bold & Impactful" },

  { id: "ritu", name: "Ritu", gender: "Female", style: "Energetic & Warm" },
  { id: "priya", name: "Priya", gender: "Female", style: "Calm & Expressive" },
  { id: "neha", name: "Neha", gender: "Female", style: "Soft & Friendly" },
  { id: "shreya", name: "Shreya", gender: "Female", style: "Dynamic & Engaging" },
  { id: "simran", name: "Simran", gender: "Female", style: "Bright & Conversational" },
  { id: "niharika", name: "Niharika", gender: "Female", style: "Elegant & Natural" },
];

// ─── Guardrail constants ───────────────────────────────────────────────────
const GUARDRAILS = {
  title: { min: 5, max: 120 },
  audience: { min: 3, max: 100 },
  customTone: { min: 5, max: 100 },
  keyword: { maxLength: 40 },
  keywords: { max: 10 },
  duration: { min: 10, max: 300 },
} as const;

// ─── Per-field error type ───────────────────────────────────────────────────
type FieldErrors = {
  title?: string;
  audience?: string;
  customTone?: string;
  keywords?: string;
  duration?: string;
};

function validateFields(opts: {
  title: string;
  audience: string;
  toneOption: string;
  customTone: string;
  keywords: string[];
  durationOption: string;
  customDuration: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const { title, audience, toneOption, customTone, keywords, durationOption, customDuration } = opts;

  // Title
  if (!title.trim()) {
    errors.title = "Title is required.";
  } else if (title.trim().length < GUARDRAILS.title.min) {
    errors.title = `Title must be at least ${GUARDRAILS.title.min} characters.`;
  } else if (title.trim().length > GUARDRAILS.title.max) {
    errors.title = `Title must be at most ${GUARDRAILS.title.max} characters.`;
  } else if (/^[^a-zA-Z0-9]+$/.test(title.trim())) {
    errors.title = "Title must contain at least one letter or number.";
  }

  // Audience
  if (!audience.trim()) {
    errors.audience = "Intended audience is required.";
  } else if (audience.trim().length < GUARDRAILS.audience.min) {
    errors.audience = `Audience must be at least ${GUARDRAILS.audience.min} characters.`;
  } else if (audience.trim().length > GUARDRAILS.audience.max) {
    errors.audience = `Audience must be at most ${GUARDRAILS.audience.max} characters.`;
  }

  // Custom tone
  if (toneOption === "custom") {
    if (!customTone.trim()) {
      errors.customTone = "Please describe your custom tone.";
    } else if (customTone.trim().length < GUARDRAILS.customTone.min) {
      errors.customTone = `Custom tone must be at least ${GUARDRAILS.customTone.min} characters.`;
    } else if (customTone.trim().length > GUARDRAILS.customTone.max) {
      errors.customTone = `Custom tone must be at most ${GUARDRAILS.customTone.max} characters.`;
    }
  }

  // Keywords
  if (keywords.length > GUARDRAILS.keywords.max) {
    errors.keywords = `You can add a maximum of ${GUARDRAILS.keywords.max} keywords.`;
  } else {
    const tooLong = keywords.find((kw) => kw.length > GUARDRAILS.keyword.maxLength);
    if (tooLong) {
      errors.keywords = `Keyword "${tooLong.substring(0, 20)}…" exceeds the ${GUARDRAILS.keyword.maxLength}-character limit.`;
    }
  }

  // Duration
  if (durationOption === "custom") {
    const parsed = parseInt(customDuration, 10);
    if (!customDuration || isNaN(parsed) || parsed <= 0) {
      errors.duration = "Please enter a valid positive number.";
    } else if (parsed < GUARDRAILS.duration.min) {
      errors.duration = `Duration must be at least ${GUARDRAILS.duration.min} seconds.`;
    } else if (parsed > GUARDRAILS.duration.max) {
      errors.duration = `Duration must be at most ${GUARDRAILS.duration.max} seconds.`;
    }
  }

  return errors;
}

// ─── Small helper: field-level error badge ──────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-destructive font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <ShieldAlert className="size-3 shrink-0" />
      {message}
    </p>
  );
}

// ─── Character counter ──────────────────────────────────────────────────────
function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const near = len >= max * 0.85;
  const over = len > max;
  return (
    <span
      className={`text-[10px] font-mono tabular-nums ml-auto ${
        over ? "text-destructive" : near ? "text-amber-500" : "text-muted-foreground/50"
      }`}
    >
      {len}/{max}
    </span>
  );
}

export function CreateReelDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [durationOption, setDurationOption] = useState("30");
  const [customDuration, setCustomDuration] = useState("");
  
  // New input states
  const [toneOption, setToneOption] = useState("Professional");
  const [customTone, setCustomTone] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [voice, setVoice] = useState("shubh");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { createReel, generateReelScript, generateFrameAssets, generateReelBackgroundMusic } = useReel();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const resetForm = () => {
    setTitle("");
    setAudience("");
    setDurationOption("30");
    setCustomDuration("");
    setToneOption("Professional");
    setCustomTone("");
    setKeywordInput("");
    setKeywords([]);
    setVoice("shubh");
    setError(null);
    setFieldErrors({});
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const handleAddKeyword = (kw: string) => {
    const trimmed = kw.trim().replace(/^#/, "");
    if (!trimmed) return;

    if (trimmed.length > GUARDRAILS.keyword.maxLength) {
      setFieldErrors((prev) => ({
        ...prev,
        keywords: `Keyword is too long (max ${GUARDRAILS.keyword.maxLength} characters).`,
      }));
      return;
    }

    if (keywords.length >= GUARDRAILS.keywords.max) {
      setFieldErrors((prev) => ({
        ...prev,
        keywords: `You can add a maximum of ${GUARDRAILS.keywords.max} keywords.`,
      }));
      return;
    }

    if (!keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
      setFieldErrors((prev) => ({ ...prev, keywords: undefined }));
    }
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    setKeywords((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFieldErrors((prev) => ({ ...prev, keywords: undefined }));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (keywordInput.trim()) {
        handleAddKeyword(keywordInput);
        setKeywordInput("");
      }
    }
  };

  // Clear field error on change
  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: undefined }));
  };
  const handleAudienceChange = (v: string) => {
    setAudience(v);
    if (fieldErrors.audience) setFieldErrors((p) => ({ ...p, audience: undefined }));
  };
  const handleCustomToneChange = (v: string) => {
    setCustomTone(v);
    if (fieldErrors.customTone) setFieldErrors((p) => ({ ...p, customTone: undefined }));
  };
  const handleCustomDurationChange = (v: string) => {
    setCustomDuration(v);
    if (fieldErrors.duration) setFieldErrors((p) => ({ ...p, duration: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Include any trailing keyword in the input box
    let finalKeywords = [...keywords];
    if (keywordInput.trim() && !finalKeywords.includes(keywordInput.trim())) {
      finalKeywords.push(keywordInput.trim());
    }

    // Run all guardrails
    const errors = validateFields({
      title,
      audience,
      toneOption,
      customTone,
      keywords: finalKeywords,
      durationOption,
      customDuration,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted errors before submitting.");
      return;
    }

    let finalDuration = 30;
    if (durationOption === "custom") {
      finalDuration = parseInt(customDuration, 10);
    } else {
      finalDuration = parseInt(durationOption, 10);
    }

    const finalTone = toneOption === "custom" ? customTone.trim() : toneOption;

    setIsSubmitting(true);

    try {
      console.log("Running 1");
      const result = await createReel({
        title,
        audience,
        durationSeconds: finalDuration,
        tone: finalTone,
        keywords: finalKeywords,
        voice,
      });

      console.log("Running 2");
      const res = await generateReelScript(result.id);
      console.log("Running 3");
      const res1 = await generateReelBackgroundMusic(result.id);
      console.log("Running 4");
      const response = await generateFrameAssets(result.id);

      // Close modal and redirect to new reel page
      setIsOpen(false);
      router.push(`/client/dashboard/reels/${result.id}`);
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
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1 no-scrollbar">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium">
              <ShieldAlert className="size-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Film className="size-3.5 text-muted-foreground" />
                Title
              </label>
              <CharCount value={title} max={GUARDRAILS.title.max} />
            </div>
            <input
              type="text"
              id="title"
              placeholder="e.g. 5 Coding Mistakes to Avoid"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={isSubmitting}
              maxLength={GUARDRAILS.title.max + 10}
              className={`w-full rounded-xl border bg-muted/20 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
                fieldErrors.title
                  ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              }`}
            />
            <FieldError message={fieldErrors.title} />
          </div>

          {/* Intended Audience Input */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="audience" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-muted-foreground" />
                Intended Audience
              </label>
              <CharCount value={audience} max={GUARDRAILS.audience.max} />
            </div>
            <input
              type="text"
              id="audience"
              placeholder="e.g. Junior Web Developers, Students"
              value={audience}
              onChange={(e) => handleAudienceChange(e.target.value)}
              disabled={isSubmitting}
              maxLength={GUARDRAILS.audience.max + 10}
              className={`w-full rounded-xl border bg-muted/20 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
                fieldErrors.audience
                  ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              }`}
            />
            <FieldError message={fieldErrors.audience} />
          </div>

          {/* Tone Selection */}
          <div className="space-y-1.5">
            <label htmlFor="tone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-muted-foreground" />
              Tone Selection
            </label>
            <Select
              value={toneOption}
              onValueChange={(val) => setToneOption(val || "Professional")}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full h-10.5! rounded-xl bg-muted/20 border border-border px-3.5 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 flex items-center justify-between">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="w-full max-w-[calc(100vw-2rem)] border border-border bg-card shadow-2xl p-1 rounded-xl">
                <SelectItem value="Professional">Professional (Polished & Business)</SelectItem>
                <SelectItem value="Funny">Funny (Witty, Humorous & Entertaining)</SelectItem>
                <SelectItem value="Luxury">Luxury (Premium, High-end & Sophisticated)</SelectItem>
                <SelectItem value="Educational">Educational (Informative & Instructional)</SelectItem>
                <SelectItem value="Motivational">Motivational (Inspiring & Energetic)</SelectItem>
                <SelectItem value="Casual">Casual (Friendly & Conversational)</SelectItem>
                <SelectItem value="custom">Custom Tone...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Tone Input (Conditional) */}
          {toneOption === "custom" && (
            <div className="space-y-1.5 pl-3 border-l-2 border-primary/40 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1.5">
                <label htmlFor="custom-tone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  Custom Tone Description
                </label>
                <CharCount value={customTone} max={GUARDRAILS.customTone.max} />
              </div>
              <input
                type="text"
                id="custom-tone"
                placeholder="e.g. Sarcastic yet informative, dramatic thriller"
                value={customTone}
                onChange={(e) => handleCustomToneChange(e.target.value)}
                disabled={isSubmitting}
                maxLength={GUARDRAILS.customTone.max + 10}
                className={`w-full h-10.5! rounded-xl border bg-muted/20 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.customTone
                    ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              <FieldError message={fieldErrors.customTone} />
            </div>
          )}

          {/* Keyword Suggestions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="keywords" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="size-3.5 text-muted-foreground" />
                Keyword Suggestions
              </label>
              <span className={`text-[10px] font-mono tabular-nums ${keywords.length >= GUARDRAILS.keywords.max ? "text-destructive" : "text-muted-foreground/50"}`}>
                {keywords.length}/{GUARDRAILS.keywords.max}
              </span>
            </div>
            <div className="space-y-2">
              <div className={`flex flex-wrap gap-1.5 min-h-10.5! p-2 rounded-xl border bg-muted/20 items-center transition-colors ${
                fieldErrors.keywords ? "border-destructive/50" : "border-border"
              }`}>
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                  >
                    #{kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      disabled={isSubmitting}
                      className="cursor-pointer hover:text-destructive text-primary/70 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  id="keywords"
                  placeholder={keywords.length === 0 ? "Type keyword and press Enter..." : keywords.length >= GUARDRAILS.keywords.max ? "Max keywords reached" : "Add another..."}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  onBlur={() => {
                    if (keywordInput.trim()) {
                      handleAddKeyword(keywordInput);
                      setKeywordInput("");
                    }
                  }}
                  disabled={isSubmitting || keywords.length >= GUARDRAILS.keywords.max}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none px-1 disabled:cursor-not-allowed"
                />
              </div>
              <FieldError message={fieldErrors.keywords} />

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Suggestions:</span>
                {KEYWORD_SUGGESTIONS.map((suggestion) => {
                  const isAdded = keywords.includes(suggestion);
                  const isFull = keywords.length >= GUARDRAILS.keywords.max;
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isSubmitting || isAdded || isFull}
                      onClick={() => handleAddKeyword(suggestion)}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all duration-150 cursor-pointer ${
                        isAdded
                          ? "bg-muted text-muted-foreground/40 line-through cursor-default"
                          : isFull
                          ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                          : "bg-muted/60 hover:bg-primary/15 hover:text-primary text-muted-foreground border border-border/50"
                      }`}
                    >
                      + {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-1.5">
            <label htmlFor="voice" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mic className="size-3.5 text-muted-foreground" />
              Voice Selection
            </label>
            <Select
              value={voice}
              onValueChange={(val) => setVoice(val || "shubh")}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full h-10.5! rounded-xl bg-muted/20 border border-border px-3.5 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 flex items-center justify-between">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent className="w-full max-w-[calc(100vw-2rem)] border border-border bg-card shadow-2xl p-1 rounded-xl">
                {VOICE_OPTIONS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} ({v.gender}) — {v.style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <SelectTrigger className="w-full h-10.5! rounded-xl bg-muted/20 border border-border px-3.5 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 flex items-center justify-between">
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
                <span className="text-[10px] text-muted-foreground font-normal ml-1">({GUARDRAILS.duration.min}–{GUARDRAILS.duration.max}s)</span>
              </label>
              <input
                type="number"
                id="custom-duration"
                min={GUARDRAILS.duration.min}
                max={GUARDRAILS.duration.max}
                placeholder={`Enter duration (${GUARDRAILS.duration.min}–${GUARDRAILS.duration.max} seconds)`}
                value={customDuration}
                onChange={(e) => handleCustomDurationChange(e.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-xl border bg-muted/20 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.duration
                    ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              <FieldError message={fieldErrors.duration} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating Reel...
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
        className="w-full! md:w-fit! reelbtn gap-2 border-border/80 bg-background hover:bg-muted text-foreground transition-all duration-200"
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
