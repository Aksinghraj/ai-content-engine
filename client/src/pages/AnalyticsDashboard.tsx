import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Calendar } from "lucide-react";

// Mock data
const MOCK_PERFORMANCE_DATA = [
  { date: "Mon", engagement: 240, reach: 2400, clicks: 240 },
  { date: "Tue", engagement: 320, reach: 2210, clicks: 290 },
  { date: "Wed", engagement: 200, reach: 2290, clicks: 200 },
  { date: "Thu", engagement: 278, reach: 2000, clicks: 221 },
  { date: "Fri", engagement: 189, reach: 2181, clicks: 250 },
  { date: "Sat", engagement: 239, reach: 2500, clicks: 210 },
  { date: "Sun", engagement: 349, reach: 2100, clicks: 290 },
];

const MOCK_PLATFORM_DATA = [
  { name: "Twitter", value: 35, color: "#3B82F6" },
  { name: "LinkedIn", value: 25, color: "#0A66C2" },
  { name: "Instagram", value: 20, color: "#E4405F" },
  { name: "TikTok", value: 15, color: "#000000" },
  { name: "YouTube", value: 5, color: "#FF0000" },
];

const MOCK_CONTENT_STATS = [
  { title: "Total Posts", value: "127", icon: Calendar, color: "from-blue-600 to-blue-400" },
  { title: "Total Engagement", value: "12.4K", icon: Heart, color: "from-red-600 to-red-400" },
  { title: "Total Reach", value: "245K", icon: Eye, color: "from-purple-600 to-purple-400" },
  { title: "Avg. CTR", value: "3.2%", icon: TrendingUp, color: "from-green-600 to-green-400" },
];

const MOCK_TOP_CONTENT = [
  { id: 1, title: "How to Master AI Content Creation", engagement: 2840, platform: "LinkedIn", date: "2 days ago" },
  { id: 2, title: "5 Tips for Viral Social Media", engagement: 2145, platform: "Twitter", date: "3 days ago" },
  { id: 3, title: "The Future of Content Marketing", engagement: 1923, platform: "Instagram", date: "4 days ago" },
  { id: 4, title: "AI Tools Every Creator Should Know", engagement: 1654, platform: "YouTube", date: "5 days ago" },
  { id: 5, title: "Content Strategy for 2024", engagement: 1432, platform: "TikTok", date: "6 days ago" },
];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            </div>
            <div className="flex gap-2">
              {["7d", "30d", "90d"].map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  variant={timeRange === range ? "default" : "outline"}
                  className={timeRange === range ? "bg-blue-600" : "border-slate-600"}
                >
                  {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-slate-400">Track your content performance across all platforms</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MOCK_CONTENT_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={MOCK_PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }} />
                <Legend />
                <Line type="monotone" dataKey="engagement" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
                <Line type="monotone" dataKey="reach" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: "#8B5CF6" }} />
                <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Platform Distribution */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={MOCK_PLATFORM_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {MOCK_PLATFORM_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {MOCK_PLATFORM_DATA.map((platform, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                    <span className="text-slate-300">{platform.name}</span>
                  </div>
                  <span className="font-semibold text-white">{platform.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Performing Content */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Content</h2>
          <div className="space-y-3">
            {MOCK_TOP_CONTENT.map((content, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">{content.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">{content.platform}</span>
                    <span>{content.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{content.engagement}</div>
                  <div className="text-xs text-slate-400">engagements</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
            <h2 className="text-xl font-semibold mb-4">Engagement Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }} />
                <Legend />
                <Bar dataKey="engagement" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="clicks" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Engagement Rate</span>
                  <span className="font-semibold text-blue-400">8.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: "82%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Click-Through Rate</span>
                  <span className="font-semibold text-purple-400">3.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: "32%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Share Rate</span>
                  <span className="font-semibold text-green-400">1.8%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: "18%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Conversion Rate</span>
                  <span className="font-semibold text-orange-400">0.9%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: "9%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
