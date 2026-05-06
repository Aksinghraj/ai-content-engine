import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Zap, Target, Share2, Eye } from "lucide-react";

const performanceData = [
  { date: "Mon", engagement: 2400, reach: 2210, conversions: 229 },
  { date: "Tue", engagement: 1398, reach: 2290, conversions: 221 },
  { date: "Wed", engagement: 9800, reach: 2000, conversions: 229 },
  { date: "Thu", engagement: 3908, reach: 2108, conversions: 200 },
  { date: "Fri", engagement: 4800, reach: 2105, conversions: 340 },
  { date: "Sat", engagement: 3800, reach: 2260, conversions: 250 },
  { date: "Sun", engagement: 4300, reach: 2100, conversions: 210 },
];

const platformData = [
  { name: "Instagram", value: 35, color: "#E4405F" },
  { name: "Twitter", value: 25, color: "#1DA1F2" },
  { name: "LinkedIn", value: 20, color: "#0077B5" },
  { name: "Facebook", value: 15, color: "#1877F2" },
  { name: "Blog", value: 5, color: "#FF6B35" },
];

const contentTypeData = [
  { type: "Video Scripts", performance: 92 },
  { type: "Blog Posts", performance: 78 },
  { type: "Social Posts", performance: 85 },
  { type: "Email Campaigns", performance: 88 },
  { type: "Tweets", performance: 72 },
];

const audienceInsights = [
  { metric: "Total Followers", value: "124.5K", change: "+12.5%" },
  { metric: "Avg. Engagement Rate", value: "8.3%", change: "+2.1%" },
  { metric: "Reach This Month", value: "2.4M", change: "+45.2%" },
  { metric: "Conversion Rate", value: "3.2%", change: "+0.8%" },
];

export default function Analytics() {
  const { user } = useAuth();

  if (user?.subscriptionTier !== "pro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-purple-500/20 p-8 text-center">
            <Eye className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pro Feature</h2>
            <p className="text-slate-300 mb-6">Advanced analytics is only available for Pro users. Upgrade now to track your content performance!</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Upgrade to Pro
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics & Performance</h1>
          <p className="text-slate-300">Track your content performance across all platforms</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {audienceInsights.map((insight, idx) => (
            <Card key={idx} className="bg-slate-800/50 border-purple-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{insight.metric}</p>
                  <p className="text-2xl font-bold text-white">{insight.value}</p>
                  <p className="text-green-400 text-sm mt-1">{insight.change}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement Trend */}
          <Card className="bg-slate-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Engagement Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line type="monotone" dataKey="engagement" stroke="#a855f7" strokeWidth={2} />
                <Line type="monotone" dataKey="reach" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Platform Distribution */}
          <Card className="bg-slate-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={platformData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Content Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Content Type Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="type" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="performance" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Audience Insights */}
          <Card className="bg-slate-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Audience Growth</p>
                  <p className="text-slate-400 text-xs">+2,450 new followers this week</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Peak Engagement</p>
                  <p className="text-slate-400 text-xs">Tuesday at 2 PM - 45% higher engagement</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Best Performing Content</p>
                  <p className="text-slate-400 text-xs">Video scripts - 92% engagement rate</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Share2 className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Viral Potential</p>
                  <p className="text-slate-400 text-xs">3 posts trending in your niche</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
