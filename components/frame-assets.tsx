"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  X, 
  Copy, 
  Check, 
  Mic, 
  Film, 
  ImageIcon, 
  Loader2, 
  AlertTriangle, 
  Download 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AssetStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface FrameImage {
  id: string;
  prompt: string;
  imageUrl: string | null;
  processingStatus: AssetStatus;
}

interface FrameVoice {
  id: string;
  language: string;
  audioUrl: string | null;
  processingStatus: AssetStatus;
}

interface FrameVideo {
  id: string;
  prompt: string;
  videoUrl: string | null;
  processingStatus: AssetStatus;
}

interface FrameAssetsProps {
  images: FrameImage[];
  voices: FrameVoice[];
  videos: FrameVideo[];
}

export function FrameAssets({ images, voices, videos }: FrameAssetsProps) {
  const hasAssets = images.length > 0 || voices.length > 0 || videos.length > 0;

  if (!hasAssets) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
        <Film className="h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="text-sm font-medium text-foreground/80">No assets generated yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Assets will appear here once storyboard generation starts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5" />
            Generated Videos
          </h4>
          <div className="grid gap-4 sm:grid-cols-1">
            {videos.map((video) => (
              <VideoPlayerCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Images & Voice Row Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Images Section */}
        {images.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Generated Images
            </h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2">
              {images.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          </div>
        )}

        {/* Voices Section */}
        {voices.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5" />
              Voiceovers
            </h4>
            <div className="space-y-3">
              {voices.map((voice) => (
                <AudioPlayerCard key={voice.id} voice={voice} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   IMAGE CARD WITH LIGHTBOX & PROMPT INFO
   ========================================== */
function ImageCard({ image }: { image: FrameImage }) {
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (image.processingStatus === "PENDING" || image.processingStatus === "PROCESSING") {
    return (
      <div className="relative aspect-video sm:aspect-square flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-3 text-center animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-primary/80 mb-2" />
        <span className="text-xs font-medium text-muted-foreground">Generating Image...</span>
      </div>
    );
  }

  if (image.processingStatus === "FAILED" || !image.imageUrl) {
    return (
      <div className="relative aspect-video sm:aspect-square flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center">
        <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
        <span className="text-xs font-medium text-destructive">Failed to generate</span>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={() => setLightboxOpen(true)}
        className="group relative aspect-video sm:aspect-square overflow-hidden rounded-xl border border-border bg-muted/30 cursor-pointer shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={image.imageUrl} 
          alt={image.prompt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-between p-3">
          <div className="flex justify-end gap-2">
            <div className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/80">
              <ZoomIn className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-200 line-clamp-2 leading-snug drop-shadow">
            {image.prompt}
          </p>
        </div>
      </div>

      {/* Lightbox Modal — rendered via portal directly on document.body to escape
          any ancestor stacking context (overflow-x-hidden on <main>, sticky header, etc.) */}
      {lightboxOpen && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full flex flex-col items-center gap-4 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setLightboxOpen(false)}
              className="cursor-pointer absolute top-4 right-4 rounded-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative w-full aspect-video sm:aspect-[4/3] max-h-[70vh] rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={image.imageUrl} 
                alt={image.prompt}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="w-full space-y-2 text-left px-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Image Prompt</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyPrompt}
                    className="cursor-pointer flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy Prompt"}
                  </button>
                  <a 
                    href={image.imageUrl} 
                    download={`frame-image-${image.id}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-900">
                {image.prompt}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* ==========================================
   CUSTOM AUDIO PLAYER WITH SIMULATED WAVEFORM
   ========================================== */
function AudioPlayerCard({ voice }: { voice: FrameVoice }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.error("Error playing audio", err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatAudioTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (voice.processingStatus === "PENDING" || voice.processingStatus === "PROCESSING") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3.5 animate-pulse">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-3.5 w-24 bg-zinc-300 dark:bg-zinc-800 rounded mb-1.5" />
          <div className="h-2 w-32 bg-zinc-200 dark:bg-zinc-900 rounded" />
        </div>
      </div>
    );
  }

  if (voice.processingStatus === "FAILED" || !voice.audioUrl) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Voice Failed</p>
          <p className="text-xs text-muted-foreground">Generation error</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 shadow-sm transition-all duration-200 hover:border-primary/20">
      <audio ref={audioRef} src={voice.audioUrl} preload="metadata" />

      {/* Info row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Mic className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground/90 leading-tight">
              Voice ({voice.language})
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Attempt 1 &middot; {voice.audioUrl.substring(voice.audioUrl.lastIndexOf("/") + 1).slice(0, 15)}...
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono tracking-tight font-medium uppercase">
          {voice.processingStatus}
        </Badge>
      </div>

      {/* Control row */}
      <div className="flex items-center gap-3.5 mt-1">
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlay}
          className="cursor-pointer flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 active:scale-95 transition"
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
        </button>

        {/* Waveform and Progress Bar Area */}
        <div className="flex-1 space-y-1.5">
          {/* Simulated Waveform */}
          <div className="flex items-end justify-between h-5 gap-[2px] px-1 pointer-events-none opacity-80">
            {WAVE_BARS.map((height, i) => {
              const active = isPlaying && (i / WAVE_BARS.length) < (currentTime / (duration || 1));
              return (
                <div 
                  key={i} 
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 30}ms`
                  }}
                  className={`w-full rounded-[1px] bg-muted-foreground/30 transition-all duration-300 ${
                    active ? "bg-primary animate-pulse" : ""
                  }`}
                />
              );
            })}
          </div>

          {/* Seek Input */}
          <div className="relative group/slider flex items-center">
            <input 
              type="range" 
              min={0} 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary group-hover/slider:h-1.5 transition-all outline-none"
            />
          </div>
        </div>

        {/* Mute Button */}
        <button 
          onClick={toggleMute}
          className="cursor-pointer text-muted-foreground hover:text-foreground transition p-1"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Duration Labels */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/80 px-0.5">
        <span>{formatAudioTime(currentTime)}</span>
        <span>{formatAudioTime(duration)}</span>
      </div>
    </div>
  );
}

// Waveform layout values
const WAVE_BARS = [
  30, 45, 60, 40, 20, 50, 75, 90, 60, 40, 25, 45, 70, 85, 95, 65, 40, 50, 70, 55, 30, 40, 60, 45, 20, 35, 65, 80, 50, 30
];


/* ==========================================
   CUSTOM VIDEO PLAYER WITH DETAILED CONTROLS
   ========================================== */
function VideoPlayerCard({ video }: { video: FrameVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Handles hiding controls after mouse is idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => console.error("Error playing video", err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = parseFloat(e.target.value);
    video.currentTime = val;
    setCurrentTime(val);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Keep state in sync with actual fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatVideoTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (video.processingStatus === "PENDING" || video.processingStatus === "PROCESSING") {
    return (
      <div className="relative aspect-video w-full flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-4 text-center animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80 mb-2" />
        <span className="text-sm font-medium text-muted-foreground">Generating Video Asset...</span>
        <span className="text-xs text-muted-foreground/60 max-w-sm mt-1 truncate">{video.prompt}</span>
      </div>
    );
  }

  if (video.processingStatus === "FAILED" || !video.videoUrl) {
    return (
      <div className="relative aspect-video w-full flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <span className="text-sm font-medium text-destructive">Video Generation Failed</span>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{video.prompt}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setControlsVisible(false)}
        className="group relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-sm"
      >
        <video 
          ref={videoRef}
          src={video.videoUrl}
          onClick={togglePlay}
          muted={isMuted}
          playsInline
          className="h-full w-full object-contain cursor-pointer"
        />

        {/* Play/Pause Central Overlay Button (visible when paused or hovering) */}
        <div 
          onClick={togglePlay}
          className={`absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity duration-300 cursor-pointer ${
            !isPlaying || controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md shadow-lg border border-white/20 transition hover:scale-105 active:scale-95">
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
          </div>
        </div>

        {/* Video Prompt Top Overlay */}
        <div className={`absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 flex justify-between items-start gap-4 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          <div className="pr-12">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Video
            </span>
            <p className="text-xs text-zinc-100 mt-1 line-clamp-1 drop-shadow-sm font-medium">
              {video.prompt}
            </p>
          </div>
        </div>

        {/* Controls Bottom Overlay */}
        <div className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 space-y-2.5 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          {/* Progress Slider */}
          <div className="flex items-center gap-2 group/seek">
            <input 
              type="range" 
              min={0} 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:h-1.5 transition-all outline-none"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {/* Play Button */}
              <button 
                onClick={togglePlay}
                className="cursor-pointer hover:text-primary transition p-1"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              </button>

              {/* Mute Button */}
              <button 
                onClick={toggleMute}
                className="cursor-pointer hover:text-primary transition p-1"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Time tracker */}
              <div className="text-[11px] font-mono text-zinc-200">
                <span>{formatVideoTime(currentTime)}</span>
                <span className="text-zinc-500 mx-1">/</span>
                <span>{formatVideoTime(duration)}</span>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Fullscreen Button */}
              <button 
                onClick={toggleFullscreen}
                className="cursor-pointer hover:text-primary transition p-1"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
