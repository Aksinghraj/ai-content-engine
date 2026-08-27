import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, BarChart3, Heart, Loader2, Users } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type AnalyticsRecord = { date: string | Date; engagement?: number | null; reach?: number | null; conversions?: number | null };

export default function UsageAnalytics() {
  const analyticsQuery = trpc.analytics.getContentAnalytics.useQuery({ days: 30 });
  const records = ((analyticsQuery.data?.data ?? []) as AnalyticsRecord[]).filter((record) => record.date);
  const reach = records.reduce((total, record) => total + Number(record.reach || 0), 0);
  const engagement = records.reduce((total, record) => total + Number(record.engagement || 0), 0);
  const conversions = records.reduce((total, record) => total + Number(record.conversions || 0), 0);
  const engagementRate = reach > 0 ? ((engagement / reach) * 100).toFixed(2) : "0.00";
  const chartData = records.map((record) => ({ date: new Date(record.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), reach: Number(record.reach || 0), engagement: Number(record.engagement || 0) }));

  return <DashboardLayout><main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6"><header><h1 className="text-3xl font-semibold text-foreground">Usage Analytics</h1><p className="mt-2 text-sm text-muted-foreground">Measured performance data from your connected providers. Lumae does not fill this view with sample activity.</p></header>
    {analyticsQuery.isLoading ? <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /><p className="mt-3">Loading your analytics…</p></CardContent></Card> : records.length === 0 ? <Card><CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><BarChart3 className="h-10 w-10 text-primary" /><h2 className="mt-4 text-lg font-semibold text-foreground">No measured analytics yet</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Connect a supported provider and publish or import activity to begin seeing measured performance here. No sample reach, engagement, or conversion figures are displayed.</p></CardContent></Card> : <><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={Users} label="Measured reach" value={reach.toLocaleString()} /><Metric icon={Heart} label="Measured engagement" value={engagement.toLocaleString()} /><Metric icon={Activity} label="Engagement rate" value={`${engagementRate}%`} /><Metric icon={BarChart3} label="Measured conversions" value={conversions.toLocaleString()} /></section><Card><CardHeader><CardTitle>Measured activity over time</CardTitle><CardDescription>Only data returned and stored for your account is charted.</CardDescription></CardHeader><CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="date" stroke="currentColor" tick={{ fill: "currentColor", fontSize: 12 }} /><YAxis stroke="currentColor" tick={{ fill: "currentColor", fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="reach" stroke="#6366f1" strokeWidth={2} name="Reach" /><Line type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={2} name="Engagement" /></LineChart></ResponsiveContainer></div></CardContent></Card></>}</main></DashboardLayout>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold text-foreground">{value}</p></div><Icon className="h-7 w-7 text-primary" /></CardContent></Card>;
}
