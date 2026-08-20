"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Heart,
  Zap,
  Target,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LumaeLightPulse } from "@/components/LumaeLightPulse";

export default function AnalyticsDashboardEnhanced() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data
  const { data: dashboardData, isLoading, refetch } = trpc.analytics.getContentAnalytics.useQuery({ days: 30 });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Analytics updated");
    } catch (error) {
      toast.error("Failed to refresh analytics");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    toast.info("Exporting analytics report...");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LumaeLightPulse state="working" size={18} label="Lumae is preparing analytics" />
        </div>
      </DashboardLayout>
    );
  }

  // Prepare chart data from analytics — backend returns { success, data: [...] }
  const analyticsData = (dashboardData?.data || []) as any[];
  const chartData = analyticsData.slice(0, 10).map((item: any) => ({
    date: new Date(item.date).toLocaleDateString(),
    engagement: item.engagement || 0,
    reach: item.reach || 0,
    conversions: item.conversions || 0,
  }));

  const totalEngagement = analyticsData.reduce((sum, item) => sum + (item.engagement || 0), 0);
  const totalReach = analyticsData.reduce((sum, item) => sum + (item.reach || 0), 0);
  const totalConversions = analyticsData.reduce((sum, item) => sum + (item.conversions || 0), 0);
  const avgEngagementRate = analyticsData.length > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-2">Real-time performance metrics and insights</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-purple-500/50 hover:bg-purple-500/10"
            >
              {isRefreshing ? <LumaeLightPulse state="working" size={18} className="mr-2" label="Lumae is refreshing analytics" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Reach</p>
                <p className="text-2xl font-bold text-white mt-2">{totalReach.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Engagement</p>
                <p className="text-2xl font-bold text-white mt-2">{totalEngagement.toLocaleString()}</p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Engagement Rate</p>
                <p className="text-2xl font-bold text-white mt-2">{avgEngagementRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversions</p>
                <p className="text-2xl font-bold text-white mt-2">{totalConversions.toLocaleString()}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
              <Legend />
              <Line type="monotone" dataKey="reach" stroke="#a855f7" name="Reach" />
              <Line type="monotone" dataKey="engagement" stroke="#ec4899" name="Engagement" />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Recommendations */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            AI Recommendations
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-gray-300">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 mt-1">✓</Badge>
              <span>Your engagement rate is {avgEngagementRate}% - keep creating similar content</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 mt-1">✓</Badge>
              <span>Post during peak hours (9-11 AM and 7-9 PM) for maximum reach</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 mt-1">✓</Badge>
              <span>Focus on content that drives conversions - you have {totalConversions} conversions this month</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 mt-1">✓</Badge>
              <span>Increase posting frequency to 3-4 times per week to boost reach</span>
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
