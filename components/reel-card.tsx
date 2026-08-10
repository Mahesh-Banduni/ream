"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  X,
  ExternalLink,
  Film,
  Clock,
  Layers,
  Loader2,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminReel } from "@/app/lib/admin-data";

type StatusTone = "success" | "warning" | "destructive" | "muted" | "outline";

function getStatusTone(status: string): StatusTone {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "RENDERING":
    case "PROCESSING":
    case "IMAGES_GENERATING":
    case "VOICES_GENERATING":
    case "VIDEOS_GENERATING":
    case "STORYBOARD_GENERATED":
    case "REVIEWING":
    case "SCRIPT_GENERATED":
      return "warning";
    case "FAILED":
      return "destructive";
    default:
      return "muted";
  }
}

interface ReelCardProps {
  reel: AdminReel;
  onDelete?: (reelId: string) => void;
}

export function ReelCard({ reel }: ReelCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const hasVideo =
    reel.finalReel?.videoUrl &&
    reel.finalReel.processingStatus === "COMPLETED";

  const thumbnailUrl = reel.finalReel?.thumbnailUrl ?? null;

  // Pick first available image from frames as a poster fallback
  const posterImage =
    thumbnailUrl ??
    reel.frames.flatMap((f) => f.images).find((img) => img.imageUrl)
      ?.imageUrl ??
    null;

  return (
    <>
      {/* Portrait Card */}
      <div
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
        style={{ aspectRatio: "9/16" }}
      >
        {/* Background */}
        <div className="absolute inset-0">
          {posterImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={posterImage}
              alt={reel.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
              <Film className="size-16 text-primary/20" />
            </div>
          )}
          {/* Gradient overlay — bottom heavy so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        </div>

        {/* Top bar */}
        <div className="relative flex items-start justify-between p-4">
          <Badge
            variant={getStatusTone(reel.status)}
            className="backdrop-blur-sm shadow-sm"
          >
            {reel.status.replaceAll("_", " ")}
          </Badge>
          <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-mono font-semibold text-white backdrop-blur-sm">
            <Clock className="size-2.5" />
            {reel.durationSeconds}s
          </span>
        </div>

        {/* Center play button — only when final video exists */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setModalOpen(true)}
              className="cursor-pointer flex size-16 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20 shadow-lg opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 active:scale-95 hover:bg-white/25"
              aria-label="Play reel video"
            >
              <Play className="size-7 fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Bottom info */}
        <div className="relative mt-auto p-4 space-y-3">

          {/* Title */}
          <div>
            <Link title="View or edit reel details" href={`/client/dashboard/reels/${reel.id}`} className="text-sm font-bold text-white leading-snug line-clamp-2 hover:text-primary">
              {reel.title}
            </Link>
          </div>

          {/* Action buttons */}
          {/* <div className="flex gap-2">
            {hasVideo ? (
              <button
                onClick={() => setModalOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90 active:scale-[0.97]"
              >
                <Play className="size-3.5 fill-current" />
                Play
              </button>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-xs font-medium text-white/50 backdrop-blur-sm cursor-not-allowed">
                <Video className="size-3.5" />
                No video yet
              </div>
            )}

            <Link
              href={`/client/dashboard/reels/${reel.id}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white/15 px-3 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-[0.97]"
              title="View or edit reel details"
            >
              <ExternalLink className="size-3.5" />
              Details
            </Link>
          </div> */}
        </div>

        {/* Processing indicator overlay */}
        {reel.finalReel?.processingStatus === "PROCESSING" && (
          <div className="absolute top-12 inset-x-0 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              <Loader2 className="size-3 animate-spin text-primary" />
              Rendering...
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {modalOpen && hasVideo && (
        <VideoModal
          videoUrl={reel.finalReel!.videoUrl!}
          title={reel.title}
          reelId={reel.id}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

/* ==========================================
   FULLSCREEN VIDEO MODAL WITH CONTROLS
   ========================================== */
function VideoModal({
  videoUrl,
  title,
  reelId,
  onClose,
}: {
  videoUrl: string;
  title: string;
  reelId: string;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play when modal opens
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onLoaded = () => setDuration(v.duration || 0);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2500);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); setControlsVisible(true); }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.currentTime = val;
    setCurrentTime(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!isFullscreen) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const fmt = (t: number) => {
    if (isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = String(Math.floor(t % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        onMouseMove={showControls}
        onMouseLeave={() => isPlaying && setControlsVisible(false)}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-black shadow-2xl",
          // Portrait aspect ratio — max height is screen height
          "h-[90vh] max-h-[90vh]",
          isFullscreen ? "rounded-none h-screen w-screen" : "w-auto"
        )}
        style={{ aspectRatio: isFullscreen ? undefined : "9/16" }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          muted={isMuted}
          playsInline
          onClick={togglePlay}
          className="h-full w-full object-contain cursor-pointer"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "cursor-pointer absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 transition hover:bg-black/80 hover:scale-105 z-10",
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <X className="size-4" />
        </button>

        {/* Title bar */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 to-transparent p-4 pt-4 pr-14 transition-opacity duration-300",
            controlsVisible ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-sm font-bold text-white line-clamp-1 drop-shadow">{title}</p>
        </div>

        {/* Big play/pause center button */}
        <div
          onClick={togglePlay}
          className={cn(
            "absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-300",
            !isPlaying || controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {!isPlaying && (
            <div className="flex size-16 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition">
              <Play className="size-7 fill-current ml-1" />
            </div>
          )}
        </div>

        {/* Controls bottom bar */}
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 space-y-3 transition-opacity duration-300",
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Progress bar */}
          <div className="relative h-1 w-full rounded-full bg-white/20 cursor-pointer group/seek">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              step={0.1}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="cursor-pointer hover:text-primary transition p-1">
                {isPlaying ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="size-5 fill-current" />
                )}
              </button>

              {/* Mute + Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="cursor-pointer hover:text-primary transition p-1">
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-16 h-1 appearance-none bg-white/20 rounded-lg cursor-pointer accent-primary"
                />
              </div>

              {/* Time */}
              <span className="text-[11px] font-mono text-zinc-300 tabular-nums">
                {fmt(currentTime)}
                <span className="text-zinc-500 mx-1">/</span>
                {fmt(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Download */}
              <a
                href={videoUrl}
                download={`reel-${reelId}.mp4`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="size-3.5" />
              </a>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="cursor-pointer hover:text-primary transition p-1">
                {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
