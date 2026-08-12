import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Film,
  ImageIcon,
  Mic,
  Sparkles,
  FileText,
  Clock3,
  Video,
  Download,
  Loader2,
  AlertTriangle,
  Clapperboard,
  Music2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteReelButton } from "@/components/delete-reel-button";
import {
  getAdminReelById,
  getAssetTranscript,
  getStatusTone,
} from "@/app/lib/admin-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RenderReelButton } from "@/components/render-reel-button";
import { RegenerateBgMusicButton } from "@/components/regenerate-bg-music-button";
import { ReelFramesList } from "@/components/reel-frames-list";
import { BackgroundMusicStyleEditor } from "@/components/background-music-style-editor";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
}

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ reelId: string }>;
}) {
  const { reelId } = await params;
  const reel = await getAdminReelById(reelId);

  if (!reel) {
    notFound();
  }

  const finalReel = reel.finalReel;
  const hasVideo =
    finalReel?.videoUrl && finalReel.processingStatus === "COMPLETED";
  const isRendering = finalReel?.processingStatus === "PROCESSING";

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/client/dashboard/reels"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <ArrowLeft className="size-4" />
          Back to reels
        </Link>
        <DeleteReelButton reelId={reel.id} />
      </div>

      {/* Reel Header */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusTone(reel.status)}>
              {reel.status.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline">{reel.durationSeconds}s</Badge>
            {reel.tone && (
              <Badge variant="muted" className="gap-1">
                <Sparkles className="size-3 text-primary" />
                Tone: {reel.tone}
              </Badge>
            )}
            {reel.voice && (
              <Badge variant="muted" className="gap-1">
                <Mic className="size-3 text-primary" />
                Voice: {reel.voice}
              </Badge>
            )}
            {reel.reviewApproved && (
              <Badge variant="success">✓ Approved</Badge>
            )}
          </div>
          <CardTitle className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {reel.title}
          </CardTitle>
          <CardDescription className="text-sm flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <span>Target Audience: <span className="text-foreground font-semibold">{reel.audience}</span></span>
            {reel.keywords && reel.keywords.length > 0 && (
              <span className="flex items-center gap-1.5 flex-wrap">
                <span className="text-muted-foreground font-medium">Keywords:</span>
                {reel.keywords.map((kw, i) => (
                  <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                    #{kw}
                  </span>
                ))}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Film} label="Frames" value={reel.frameCount} />
            <StatCard icon={ImageIcon} label="Images" value={reel.imageCount} />
            <StatCard icon={Mic} label="Voices" value={reel.voiceCount} />
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────
          FINAL REEL VIDEO SECTION
         ───────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500/60 via-violet-500 to-violet-500/60" />
        <CardHeader className="flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="size-4 text-violet-500" />
              Final Reel Video
            </CardTitle>
            <CardDescription>
              Assembled and rendered output for this reel.
            </CardDescription>
          </div>

          {/* Status chip + render button */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            {finalReel && (
              <Badge
                variant={getStatusTone(finalReel.processingStatus)}
                className="hidden md:flex capitalize"
              >
                {finalReel.processingStatus}
              </Badge>
            )}
            <RenderReelButton reelId={reel.id} />
          </div>
        </CardHeader>

        <CardContent>
          {hasVideo ? (
            /* ── Completed Video Player ── */
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-black shadow-lg">
                {/* Portrait wrapper — center the 9:16 video inside a 16:9 letterbox so it doesn't stretch the page */}
                <div className="flex items-center justify-center bg-zinc-950 py-4">
                  <div
                    className="relative overflow-hidden rounded-xl"
                    style={{ height: "min(70vh, 600px)", aspectRatio: "9/16" }}
                  >
                    <video
                      src={finalReel!.videoUrl!}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Meta + download */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {finalReel?.duration && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock3 className="size-3.5" />
                      {finalReel.duration.toFixed(1)}s
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/70">
                    Rendered via Remotion
                  </span>
                </div>
                <a
                  href={finalReel!.videoUrl!}
                  download={`reel-${reel.id}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-2"
                  )}
                >
                  <Download className="size-3.5" />
                  Download MP4
                </a>
              </div>
            </div>
          ) : isRendering ? (
            /* ── Rendering in progress ── */
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/20 py-16 text-center">
              <div className="relative">
                <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                  <Loader2 className="size-8 animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Rendering in progress…
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Remotion is composing your reel. This may take a few minutes.
                </p>
              </div>
            </div>
          ) : finalReel?.processingStatus === "FAILED" ? (
            /* ── Render failed ── */
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 py-16 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-7" />
              </div>
              <div>
                <p className="font-semibold text-destructive">Render failed</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  An error occurred during rendering. You can retry using the
                  button above.
                </p>
              </div>
            </div>
          ) : (
            /* ── Not yet rendered ── */
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 py-16 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <Clapperboard className="size-7" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  No rendered video yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Once all assets (images & voices) are generated, click
                  &ldquo;Assemble &amp; Render Reel&rdquo; to compose the final
                  MP4.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Transcript + Background Music (flex row) ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Transcript */}
        <Card className="h-fit flex-1 min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-primary" />
              Transcript
            </CardTitle>
            <CardDescription>
              Combined hook, ending, and body copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[36rem] whitespace-pre-wrap overflow-auto rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm leading-7 text-foreground/80">
              {getAssetTranscript(reel)}
            </div>
          </CardContent>
        </Card>

        {/* Background Music */}
        <Card className="h-fit lg:w-100 shrink-0">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Music2 className="size-4 text-primary" />
                Background Music
              </CardTitle>
              <CardDescription>
                Generated soundtrack for this reel.
              </CardDescription>
            </div>
            <RegenerateBgMusicButton reelId={reel.id} />
          </CardHeader>
          <CardContent>
            {reel.backgroundMusic ? (
              <div className="space-y-3">
                <BackgroundMusicStyleEditor
                  reelId={reel.id}
                  initialStyle={reel.backgroundMusic.style_description}
                />

                {/* Audio player */}
                {reel.backgroundMusic.musicUrl ? (
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Track
                    </p>
                    <audio
                      controls
                      src={reel.backgroundMusic.musicUrl}
                      className="w-full h-8 [&::-webkit-media-controls-panel]:bg-muted"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 py-5 text-sm text-muted-foreground">
                    <Music2 className="size-4 opacity-50" />
                    No audio track yet
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 py-8 text-center">
                <Music2 className="size-7 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  No background music
                </p>
                <p className="text-xs text-muted-foreground/70 max-w-[180px]">
                  Click &ldquo;Regenerate Music&rdquo; to generate one.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Frames */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Film className="size-4 text-primary" />
            Frames
          </CardTitle>
          <CardDescription>
            Storyboard and generated asset details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReelFramesList reelId={reel.id} frames={reel.frames} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sparkles;
  label: string;
  value: number;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-110">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

