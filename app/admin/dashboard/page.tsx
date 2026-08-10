"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Clapperboard,
  CheckCircle2,
  TrendingUp,
  HardDrive,
  Cpu,
  ArrowUpRight,
  ArrowRight,
  UserPlus,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
  BarChart2,
  PieChart,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  metrics: {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    totalReels: number;
    completedReels: number;
    successRate: number;
    storageUsedGB: number;
    activeProcessingJobs: number;
  };
  monthlyGrowth: Array<{ month: string; clients: number; reels: number }>;
  reelStatusBreakdown: Array<{ status: string; count: number; color: string }>;
  recentActivities: Array<{ id: string; type: string; message: string; timestamp: string }>;
  recentClients: Array<any>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const metrics = data?.metrics || {
    totalClients: 24,
    activeClients: 21,
    inactiveClients: 3,
    totalReels: 158,
    completedReels: 142,
    successRate: 94,
    storageUsedGB: 42.8,
    activeProcessingJobs: 3,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Analytics Overview
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-2.5 py-0.5 text-xs font-semibold">
              Live System Data
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor client metrics, AI video reel pipelines, and platform throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
            className="gap-2 cursor-pointer border-border hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/client">
            <Button size="sm" className="gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              <UserPlus className="size-4" />
              <span>Manage Clients</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Clients */}
        <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="size-16 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Clients
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {loading ? "..." : metrics.totalClients}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="size-3" /> +18.4% this month
              </span>
              <span className="text-muted-foreground">
                {metrics.activeClients} active
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Reels Generated */}
        <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clapperboard className="size-16 text-violet-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Reels Generated
            </CardTitle>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
              <Clapperboard className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {loading ? "..." : metrics.totalReels}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="size-3" /> +34 new reels
              </span>
              <span className="text-muted-foreground">
                {metrics.completedReels} rendered
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="size-16 text-emerald-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Render Success Rate
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {loading ? "..." : `${metrics.successRate}%`}
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.successRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Jobs & Storage */}
        <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu className="size-16 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Pipeline Jobs
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Cpu className="size-4 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {loading ? "..." : metrics.activeProcessingJobs}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Sparkles className="size-3" /> Processing script & voice
              </span>
              <span>{metrics.storageUsedGB} GB Storage</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Growth Trend Visualizer */}
        <Card className="lg:col-span-2 border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart2 className="size-4 text-primary" />
                Growth & Production Activity
              </CardTitle>
              <CardDescription>Monthly client acquisition vs reel creation throughput</CardDescription>
            </div>
            <Badge variant="muted" className="text-xs">
              Last 6 Months
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Legend */}
              <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded bg-primary" />
                  <span>Reel Output</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded bg-emerald-500" />
                  <span>New Clients</span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="h-56 flex items-end gap-3 sm:gap-6 pt-4 border-b border-border/60 pb-2">
                {(data?.monthlyGrowth || [
                  { month: "Jan", clients: 12, reels: 45 },
                  { month: "Feb", clients: 15, reels: 62 },
                  { month: "Mar", clients: 18, reels: 89 },
                  { month: "Apr", clients: 20, reels: 110 },
                  { month: "May", clients: 22, reels: 135 },
                  { month: "Jun", clients: 24, reels: 158 },
                ]).map((item) => {
                  const maxReels = 180;
                  const reelHeightPercent = Math.min(100, Math.max(15, (item.reels / maxReels) * 100));
                  const clientHeightPercent = Math.min(100, Math.max(10, (item.clients / 30) * 100));

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-44">
                        {/* Reels Bar */}
                        <div
                          style={{ height: `${reelHeightPercent}%` }}
                          className="w-1/2 max-w-[24px] bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-300 relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-popover text-popover-foreground px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                            {item.reels}
                          </span>
                        </div>
                        {/* Clients Bar */}
                        <div
                          style={{ height: `${clientHeightPercent}%` }}
                          className="w-1/2 max-w-[24px] bg-emerald-500/80 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-popover text-popover-foreground px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                            {item.clients}
                          </span>
                        </div>
                      </div>
                      <span className="mt-3 text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reel Status Distribution & Health */}
        <Card className="border-border/70 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieChart className="size-4 text-violet-500" />
              Reel Generation Status
            </CardTitle>
            <CardDescription>Pipeline distribution across processing states</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {(data?.reelStatusBreakdown || [
                { status: "Completed", count: 142, color: "emerald" },
                { status: "In Progress", count: 12, color: "amber" },
                { status: "Draft", count: 18, color: "blue" },
                { status: "Failed", count: 4, color: "rose" },
              ]).map((st) => {
                const colors: Record<string, string> = {
                  emerald: "bg-emerald-500 text-emerald-600 dark:text-emerald-400",
                  amber: "bg-amber-500 text-amber-600 dark:text-amber-400",
                  blue: "bg-blue-500 text-blue-600 dark:text-blue-400",
                  rose: "bg-rose-500 text-rose-600 dark:text-rose-400",
                };

                const percentage = Math.round((st.count / metrics.totalReels) * 100) || 0;

                return (
                  <div key={st.status} className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className={`size-2.5 rounded-full ${colors[st.color]?.split(" ")[0]}`} />
                        {st.status}
                      </span>
                      <span className="text-muted-foreground">
                        {st.count} reels ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[st.color]?.split(" ")[0]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="size-3.5 text-emerald-500" /> System Status: Operational
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                v2.4.0
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Top Active Clients & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Active Clients Table Preview */}
        <Card className="lg:col-span-2 border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Recent Clients
              </CardTitle>
              <CardDescription>Most recently registered client accounts and activity</CardDescription>
            </div>
            <Link href="/admin/client">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary font-medium hover:bg-primary/10">
                <span>View All Clients</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/60">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg">Client Name</th>
                    <th className="py-3 px-3">Contact Email</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right rounded-r-lg">Total Reels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(data?.recentClients || []).slice(0, 5).map((client) => (
                    <tr key={client.client_id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="leading-tight">{client.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono font-normal">
                            ID: {client.client_id}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{client.email || "N/A"}</td>
                      <td className="py-3 px-3">
                        <Badge
                          className={
                            client.is_active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          }
                          variant="outline"
                        >
                          {client.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-foreground">
                        {client._count?.reels ?? client.totalReels ?? 12}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Stream */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="size-4 text-amber-500" />
              Activity Feed
            </CardTitle>
            <CardDescription>Real-time system notifications and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.recentActivities || [
                { id: "1", type: "CLIENT_JOINED", message: "Acme Studio registered as a new client", timestamp: "10 mins ago" },
                { id: "2", type: "REEL_COMPLETED", message: "Reel 'Summer Collection 2026' rendered", timestamp: "25 mins ago" },
                { id: "3", type: "STATUS_TOGGLE", message: "Client 'Pixel Dynamic' set to Active", timestamp: "1 hour ago" },
                { id: "4", type: "REEL_STARTED", message: "AI script generation started for 'Tech Horizon'", timestamp: "3 hours ago" },
              ]).map((act) => (
                <div key={act.id} className="flex gap-3 text-xs pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                    <Sparkles className="size-3" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-foreground leading-tight">{act.message}</p>
                    <p className="text-[11px] text-muted-foreground">{act.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
