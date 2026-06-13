import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Target,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Award,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WEEKLY_DATA = [
  { date: "Mon", impressions: 12400, engagement: 840, clicks: 320, conversions: 18, revenue: 540 },
  { date: "Tue", impressions: 15200, engagement: 1020, clicks: 410, conversions: 24, revenue: 720 },
  { date: "Wed", impressions: 11800, engagement: 760, clicks: 290, conversions: 15, revenue: 450 },
  { date: "Thu", impressions: 18900, engagement: 1340, clicks: 560, conversions: 32, revenue: 960 },
  { date: "Fri", impressions: 22100, engagement: 1680, clicks: 720, conversions: 41, revenue: 1230 },
  { date: "Sat", impressions: 19400, engagement: 1420, clicks: 580, conversions: 28, revenue: 840 },
  { date: "Sun", impressions: 16700, engagement: 1180, clicks: 490, conversions: 22, revenue: 660 },
];

const MONTHLY_DATA = [
  { date: "Jan", impressions: 145000, engagement: 9800, clicks: 3200, conversions: 180, revenue: 5400 },
  { date: "Feb", impressions: 162000, engagement: 11200, clicks: 3800, conversions: 210, revenue: 6300 },
  { date: "Mar", impressions: 178000, engagement: 12600, clicks: 4200, conversions: 240, revenue: 7200 },
  { date: "Apr", impressions: 195000, engagement: 14100, clicks: 4800, conversions: 275, revenue: 8250 },
  { date: "May", impressions: 221000, engagement: 16400, clicks: 5600, conversions: 318, revenue: 9540 },
  { date: "Jun", impressions: 248000, engagement: 18900, clicks: 6400, conversions: 362, revenue: 10860 },
];

const PLATFORM_ROI = [
  { platform: "LinkedIn", spend: 800, revenue: 4200, roi: 425, color: "#0A66C2", emoji: "💼", followers: 12400, engagement: 4.2 },
  { platform: "Instagram", spend: 600, revenue: 2800, roi: 367, color: "#E4405F", emoji: "📸", followers: 28900, engagement: 3.8 },
  { platform: "Twitter", spend: 400, revenue: 1600, roi: 300, color: "#1DA1F2", emoji: "🐦", followers: 8700, engagement: 2.1 },
  { platform: "TikTok", spend: 500, revenue: 2100, roi: 320, color: "#000000", emoji: "🎵", followers: 45200, engagement: 6.7 },
  { platform: "YouTube", spend: 700, revenue: 2450, roi: 250, color: "#FF0000", emoji: "▶️", followers: 6800, engagement: 5.4 },
  { platform: "Facebook", spend: 350, revenue: 980, roi: 180, color: "#1877F2", emoji: "👥", followers: 15600, engagement: 1.9 },
];

const CONTENT_PERFORMANCE = [
  { type: "Video", avgEngagement: 8.4, avgReach: 24000, conversionRate: 3.2, color: "#8B5CF6" },
  { type: "Carousel", avgEngagement: 6.1, avgReach: 18000, conversionRate: 2.8, color: "#EC4899" },
  { type: "Image", avgEngagement: 4.2, avgReach: 12000, conversionRate: 1.9, color: "#3B82F6" },
  { type: "Text Post", avgEngagement: 2.8, avgReach: 8000, conversionRate: 1.2, color: "#10B981" },
  { type: "Story", avgEngagement: 5.6, avgReach: 15000, conversionRate: 2.1, color: "#F59E0B" },
];

const TOP_POSTS = [
  { id: 1, content: "How AI is revolutionizing content creation in 2025...", platform: "linkedin", engagement: 2840, reach: 45200, conversions: 28, revenue: 840 },
  { id: 2, content: "5 viral marketing strategies that actually work 🔥", platform: "tiktok", engagement: 18400, reach: 284000, conversions: 142, revenue: 4260 },
  { id: 3, content: "Behind the scenes of our product launch...", platform: "instagram", engagement: 4200, reach: 68000, conversions: 56, revenue: 1680 },
  { id: 4, content: "The complete guide to social media ROI measurement", platform: "twitter", engagement: 1240, reach: 18900, conversions: 18, revenue: 540 },
  { id: 5, content: "Tutorial: Building an AI content pipeline in 10 minutes", platform: "youtube", engagement: 3600, reach: 52000, conversions: 44, revenue: 1320 },
];

const PLATFORM_EMOJIS: Record<string, string> = {
  instagram: "📸", twitter: "🐦", linkedin: "💼",
  facebook: "👥", youtube: "▶️", tiktok: "🎵",
};

// ─── Component ────────────────────────────────────────────────────────────────

function ROIDashboardContent() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [activeTab, setActiveTab] = useState("overview");

  const chartData = timeRange === "7d" ? WEEKLY_DATA : MONTHLY_DATA;

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalConversions = chartData.reduce((sum, d) => sum + d.conversions, 0);
  const totalImpressions = chartData.reduce((sum, d) => sum + d.impressions, 0);
  const totalEngagement = chartData.reduce((sum, d) => sum + d.engagement, 0);
  const totalSpend = PLATFORM_ROI.reduce((sum, p) => sum + p.spend, 0);
  const overallROI = Math.round(((totalRevenue - totalSpend) / totalSpend) * 100);

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+23.4%",
      positive: true,
      icon: DollarSign,
      color: "text-green-400",
      border: "border-green-500/20",
    },
    {
      title: "Overall ROI",
      value: `${overallROI}%`,
      change: "+18.2%",
      positive: true,
      icon: TrendingUp,
      color: "text-purple-400",
      border: "border-purple-500/20",
    },
    {
      title: "Total Impressions",
      value: totalImpressions >= 1000000 ? `${(totalImpressions / 1000000).toFixed(1)}M` : `${(totalImpressions / 1000).toFixed(0)}K`,
      change: "+31.7%",
      positive: true,
      icon: Eye,
      color: "text-blue-400",
      border: "border-blue-500/20",
    },
    {
      title: "Conversions",
      value: totalConversions.toLocaleString(),
      change: "+12.8%",
      positive: true,
      icon: Target,
      color: "text-pink-400",
      border: "border-pink-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-indigo-400" />
              ROI Analytics
            </h1>
            <p className="text-indigo-200">Unified cross-platform performance & return on investment</p>
          </div>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                variant={timeRange === range ? "default" : "outline"}
                className={timeRange === range
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/10"}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} className={`bg-slate-800/50 ${kpi.border} hover:border-opacity-70 transition`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{kpi.title}</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-1">{kpi.value}</p>
                      <div className={`flex items-center gap-1 mt-1 ${kpi.positive ? "text-green-400" : "text-red-400"} text-xs`}>
                        {kpi.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {kpi.change} vs last period
                      </div>
                    </div>
                    <Icon className={`w-8 h-8 ${kpi.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-indigo-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="platforms" className="data-[state=active]:bg-indigo-600">
              <Users className="w-4 h-4 mr-2" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-indigo-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Content Types
            </TabsTrigger>
            <TabsTrigger value="top-posts" className="data-[state=active]:bg-indigo-600">
              <Award className="w-4 h-4 mr-2" />
              Top Posts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Over Time */}
              <Card className="bg-slate-800/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Over Time</CardTitle>
                  <CardDescription className="text-indigo-200">Daily revenue from content marketing</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                        labelStyle={{ color: "#E2E8F0" }}
                        formatter={(value: number) => [`$${value}`, "Revenue"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="url(#revenueGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Engagement vs Impressions */}
              <Card className="bg-slate-800/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Engagement vs Impressions</CardTitle>
                  <CardDescription className="text-indigo-200">How your content performs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                        labelStyle={{ color: "#E2E8F0" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="engagement" stroke="#EC4899" strokeWidth={2} dot={false} name="Engagement" />
                      <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} dot={false} name="Clicks" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Conversions Bar Chart */}
            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Conversions by Day</CardTitle>
                <CardDescription className="text-indigo-200">Track how many visitors convert to customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                      labelStyle={{ color: "#E2E8F0" }}
                    />
                    <Bar dataKey="conversions" fill="#6366F1" radius={[4, 4, 0, 0]} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform ROI Comparison */}
              <Card className="bg-slate-800/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">ROI by Platform</CardTitle>
                  <CardDescription className="text-indigo-200">Return on investment per platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={PLATFORM_ROI} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                      <YAxis dataKey="platform" type="category" stroke="#94A3B8" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                        labelStyle={{ color: "#E2E8F0" }}
                        formatter={(value: number) => [`${value}%`, "ROI"]}
                      />
                      <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                        {PLATFORM_ROI.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Distribution Pie */}
              <Card className="bg-slate-800/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Distribution</CardTitle>
                  <CardDescription className="text-indigo-200">Revenue share by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={PLATFORM_ROI}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="revenue"
                        nameKey="platform"
                        label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {PLATFORM_ROI.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                        formatter={(value: number) => [`$${value}`, "Revenue"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Platform Details Table */}
            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Platform Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PLATFORM_ROI.sort((a, b) => b.roi - a.roi).map((platform) => (
                    <div key={platform.platform} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/20">
                      <span className="text-2xl">{platform.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">{platform.platform}</span>
                          <Badge className={`${platform.roi > 300 ? "bg-green-500/20 text-green-300 border-green-500/50" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"} border`}>
                            {platform.roi}% ROI
                          </Badge>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((platform.roi / 500) * 100, 100)}%`, backgroundColor: platform.color }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-white">${platform.revenue.toLocaleString()}</p>
                        <p className="text-slate-400">${platform.spend} spend</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-indigo-300">{platform.followers.toLocaleString()}</p>
                        <p className="text-slate-400">followers</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-pink-300">{platform.engagement}%</p>
                        <p className="text-slate-400">eng. rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Types Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Engagement by Content Type</CardTitle>
                  <CardDescription className="text-indigo-200">Average engagement rate per format</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={CONTENT_PERFORMANCE}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="type" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                        formatter={(value: number) => [`${value}%`, "Avg Engagement"]}
                      />
                      <Bar dataKey="avgEngagement" radius={[4, 4, 0, 0]}>
                        {CONTENT_PERFORMANCE.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Conversion Rate by Type</CardTitle>
                  <CardDescription className="text-indigo-200">Which content format converts best</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mt-2">
                    {CONTENT_PERFORMANCE.sort((a, b) => b.conversionRate - a.conversionRate).map((ct) => (
                      <div key={ct.type} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white text-sm font-medium">{ct.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 text-sm">{ct.conversionRate}%</span>
                            <span className="text-slate-500 text-xs">({ct.avgReach.toLocaleString()} avg reach)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${(ct.conversionRate / 4) * 100}%`, backgroundColor: ct.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Insights */}
            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  AI Content Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 font-medium text-sm mb-1">Best Performing</p>
                    <p className="text-white font-bold">Video Content</p>
                    <p className="text-green-300 text-sm mt-1">8.4% avg engagement — 2.5× better than text posts</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 font-medium text-sm mb-1">Best for Conversions</p>
                    <p className="text-white font-bold">Video + Carousel</p>
                    <p className="text-blue-300 text-sm mt-1">3.2% conversion rate — focus here for revenue</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-purple-400 font-medium text-sm mb-1">Recommendation</p>
                    <p className="text-white font-bold">Increase Video by 40%</p>
                    <p className="text-purple-300 text-sm mt-1">Projected +$2,400/month additional revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Posts Tab */}
          <TabsContent value="top-posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Top Performing Posts</h2>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/50">
                Ranked by Revenue
              </Badge>
            </div>
            {TOP_POSTS.sort((a, b) => b.revenue - a.revenue).map((post, idx) => (
              <Card key={post.id} className="bg-slate-800/50 border-indigo-500/20 hover:border-indigo-500/40 transition">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xl">{PLATFORM_EMOJIS[post.platform]}</span>
                        <span className="text-slate-400 text-sm capitalize">{post.platform}</span>
                      </div>
                      <p className="text-white line-clamp-2">{post.content}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center shrink-0">
                      <div>
                        <p className="text-xs text-slate-400">Engagement</p>
                        <p className="text-white font-semibold">{post.engagement.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Reach</p>
                        <p className="text-white font-semibold">
                          {post.reach >= 1000 ? `${(post.reach / 1000).toFixed(0)}K` : post.reach}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Conversions</p>
                        <p className="text-white font-semibold">{post.conversions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Revenue</p>
                        <p className="text-green-400 font-semibold">${post.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ROIDashboard() {
  return (
    <DashboardLayout>
      <ROIDashboardContent />
    </DashboardLayout>
  );
}
