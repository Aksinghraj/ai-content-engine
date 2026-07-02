import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
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
} from "recharts";
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Download } from "lucide-react";

const MOCK_ANALYTICS = {
  totalReach: 2450000,
  totalEngagement: 156000,
  averageEngagementRate: 6.4,
  topPerformingTrend: "AI-Powered Content Creation",
  contentGenerated: 47,
  postsPublished: 38,
  averageViews: 64474,
  averageLikes: 3289,
  averageComments: 412,
  averageShares: 156,
};

const DAILY_PERFORMANCE = [
  { date: "Jun 26", reach: 180000, engagement: 11520, posts: 3 },
  { date: "Jun 27", reach: 220000, engagement: 13200, posts: 4 },
  { date: "Jun 28", reach: 195000, engagement: 12480, posts: 2 },
  { date: "Jun 29", reach: 310000, engagement: 19840, posts: 5 },
  { date: "Jun 30", reach: 285000, engagement: 18240, posts: 4 },
  { date: "Jul 01", reach: 420000, engagement: 26880, posts: 6 },
  { date: "Jul 02", reach: 840000, engagement: 53760, posts: 8 },
];

const PLATFORM_DISTRIBUTION = [
  { name: "Instagram", value: 35, color: "#E1306C" },
  { name: "TikTok", value: 28, color: "#000000" },
  { name: "YouTube", value: 18, color: "#FF0000" },
  { name: "X (Twitter)", value: 12, color: "#1DA1F2" },
  { name: "LinkedIn", value: 7, color: "#0A66C2" },
];

const TOP_TRENDS = [
  {
    id: 1,
    title: "AI-Powered Content Creation",
    reach: 580000,
    engagement: 37120,
    posts: 12,
    engagementRate: 6.4,
  },
  {
    id: 2,
    title: "Fitness Transformation Reels",
    reach: 420000,
    engagement: 26880,
    posts: 8,
    engagementRate: 6.4,
  },
  {
    id: 3,
    title: "Viral Business Ideas 2026",
    reach: 380000,
    engagement: 24320,
    posts: 7,
    engagementRate: 6.4,
  },
  {
    id: 4,
    title: "Sustainable Fashion Movement",
    reach: 350000,
    engagement: 22400,
    posts: 6,
    engagementRate: 6.4,
  },
  {
    id: 5,
    title: "Mental Health & Wellness",
    reach: 320000,
    engagement: 20480,
    posts: 6,
    engagementRate: 6.4,
  },
];

export default function AnalyticsDashboardV2() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-400 text-lg">Sign in to view your trending content performance</p>
          <a
            href={getLoginUrl()}
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 px-4 md:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-gray-400 text-sm md:text-base">Track your trending content performance</p>
            </div>
            <div className="flex gap-2">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition text-sm md:text-base ${
                    timeRange === range
                      ? "bg-gradient-to-r from-pink-500 to-purple-600"
                      : "bg-slate-800/50 hover:bg-slate-800"
                  }`}
                >
                  {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "Last 90 Days"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Eye}
            label="Total Reach"
            value={`${(MOCK_ANALYTICS.totalReach / 1000000).toFixed(1)}M`}
            change="+24%"
            color="from-blue-500 to-cyan-500"
          />
          <MetricCard
            icon={Heart}
            label="Total Engagement"
            value={`${(MOCK_ANALYTICS.totalEngagement / 1000).toFixed(0)}K`}
            change="+18%"
            color="from-pink-500 to-red-500"
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg Engagement Rate"
            value={`${MOCK_ANALYTICS.averageEngagementRate}%`}
            change="+2.3%"
            color="from-purple-500 to-pink-500"
          />
          <MetricCard
            icon={Share2}
            label="Content Generated"
            value={MOCK_ANALYTICS.contentGenerated}
            change={`${MOCK_ANALYTICS.postsPublished} published`}
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-slate-800/30 border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Performance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={DAILY_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
                <XAxis stroke="rgba(148, 163, 184, 0.5)" />
                <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reach"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ fill: "#ec4899", r: 4 }}
                  name="Reach"
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: "#a855f7", r: 4 }}
                  name="Engagement"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Platform Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={PLATFORM_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {PLATFORM_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Trends */}
        <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Top Performing Trends</h2>
          <div className="space-y-4">
            {TOP_TRENDS.map((trend, index) => (
              <div
                key={trend.id}
                className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                      <h3 className="font-semibold break-words">{trend.title}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Reach</span>
                        <p className="font-semibold text-cyan-400">
                          {(trend.reach / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Engagement</span>
                        <p className="font-semibold text-pink-400">
                          {(trend.engagement / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Posts</span>
                        <p className="font-semibold text-purple-400">{trend.posts}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Eng. Rate</span>
                        <p className="font-semibold text-green-400">{trend.engagementRate}%</p>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition text-sm whitespace-nowrap">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="flex gap-4 justify-center pb-8">
          <button className="px-6 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export as PDF
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition font-medium flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Report
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string | number;
  change: string;
  color: string;
}) {
  return (
    <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${color} rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-semibold text-green-400">{change}</span>
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold">{value}</p>
    </div>
  );
}
