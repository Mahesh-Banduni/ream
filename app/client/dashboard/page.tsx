export const dynamic = 'force-dynamic';

import {
  BarChart3,
  CircleDollarSign,
  Film,
  ImageIcon,
  Mic,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAdminDashboardStats, getStatusTone } from "@/app/lib/admin-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Sparkles;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:shadow-md",
        accent
          ? "border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3"
          : "border-border/60 bg-card/80"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3 text-emerald-600" />
            {detail}
          </p>
        </div>
        <div
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110",
            accent
              ? "bg-primary/15 text-primary ring-primary/25"
              : "bg-muted text-muted-foreground ring-border/60"
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { reels, summary } = await getAdminDashboardStats();
  const latest = reels[0];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      {/* <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-5 [background:radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_60%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                Live operations
              </Badge>
              <Badge variant="muted">Light grey / orange</Badge>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Production command center
            </h2>
            <p className="mt-2 max-w-xl text-base text-muted-foreground">
              Track reel generation, review progress, and media assets from a single admin surface.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/client/client/dashboard/reels"
              className={cn(
                buttonVariants({ variant: "default" }),
                "gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Open Reels
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section> */}

      {/* Metric Cards */}
      <section>
        <div className="mb-4 flex items-start justify-between flex-col gap-1">
          <h3 className="text-xl font-semibold text-foreground">Dashboard Overview</h3>
          <p className="text-sm text-muted-foreground">Monitor key metrics and system activity in real time.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-2">
          {summary.map((item, index) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              detail={item.detail}
              icon={[BarChart3, Film, ImageIcon, Mic, CircleDollarSign][index] ?? Sparkles}
              accent={index === 0}
            />
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="gap-6">
        {/* Left: Latest Reel + Pipeline Health */}
        <div className="flex flex-col min-[1400px]:flex-row items-start w-full gap-6">
          {/* Latest Reel Card */}
          <Card className="w-full">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
              <div className="flex flex-col items-start gap-1.5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-4 text-primary" />
                  Latest reel
                </CardTitle>
                <CardDescription>Most recent item in the pipeline.</CardDescription>
              </div>
              {latest && (
                <Badge variant={getStatusTone(latest.status)}>
                  {latest.status.replaceAll("_", " ")}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {latest ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xl font-bold text-foreground">{latest.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{latest.audience}</p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                    <StatRow label="Frames" value={latest.frameCount} />
                    <Separator className="my-1 opacity-50" />
                    <StatRow
                      label="Review score"
                      value={latest.reviewScore?.toFixed(1) ?? "n/a"}
                    />
                    <Separator className="my-1 opacity-50" />
                    <StatRow
                      label="Total assets"
                      value={latest.imageCount + latest.voiceCount + latest.videoCount}
                    />
                    <Separator className="my-1 opacity-50" />
                    <StatRow
                      label="Review status"
                      value={latest.reviewApproved ? "✓ Approved" : "Needs review"}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/client/dashboard/reels/${latest.id}`}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      View reel
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                    <Film className="size-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">No reels yet. Start creating your first reel.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Health */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-primary" />
                Pipeline health
              </CardTitle>
              <CardDescription>Status overview of recent reels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reels.slice(0, 5).map((reel) => (
                <Link
                  key={reel.id}
                  href={`/client/dashboard/reels/${reel.id}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 transition-all duration-150 hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{reel.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{reel.frameCount} frames</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={getStatusTone(reel.status)}>
                      {reel.status.replaceAll("_", " ")}
                    </Badge>
                    <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
              {reels.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No reels in pipeline yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
      </section>
    </div>
  );
}
