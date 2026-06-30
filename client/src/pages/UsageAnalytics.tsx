import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Zap, TrendingUp, Calendar, Activity } from "lucide-react";

export default function UsageAnalytics() {
  const { user } = useAuth();

  if (!user) {
    return <DashboardLayout><div>Sign in to continue</div></DashboardLayout>;
  }

  // Mock data for demonstration (will be replaced with real data from backend)
  const dailyUsageData = [
    { date: "Mon", tokens: 450, contentGenerated: 12 },
    { date: "Tue", tokens: 620, contentGenerated: 18 },
    { date: "Wed", tokens: 380, contentGenerated: 10 },
    { date: "Thu", tokens: 890, contentGenerated: 25 },
    { date: "Fri", tokens: 720, contentGenerated: 20 },
    { date: "Sat", tokens: 540, contentGenerated: 15 },
    { date: "Sun", tokens: 310, contentGenerated: 8 },
  ];

  const contentTypeData = [
    { name: "Captions", value: 35, color: "#667eea" },
    { name: "Scripts", value: 25, color: "#764ba2" },
    { name: "Posts", value: 30, color: "#f093fb" },
    { name: "Other", value: 10, color: "#4facfe" },
  ];

  const platformStats = [
    { platform: "Instagram", usage: 45, limit: 100 },
    { platform: "YouTube", usage: 32, limit: 100 },
    { platform: "LinkedIn", usage: 28, limit: 100 },
    { platform: "Twitter", usage: 18, limit: 100 },
  ];

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
              <p className="text-muted-foreground mt-2">Track your content generation and token usage</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Used Today</p>
                  <p className="text-3xl font-bold mt-2">2,890</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from yesterday</p>
                </div>
                <Zap className="h-10 w-10 text-yellow-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Content Generated</p>
                  <p className="text-3xl font-bold mt-2">108</p>
                  <p className="text-xs text-green-600 mt-1">↑ 8% from last week</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Daily Usage</p>
                  <p className="text-3xl font-bold mt-2">571</p>
                  <p className="text-xs text-muted-foreground mt-1">tokens/day</p>
                </div>
                <Activity className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-3xl font-bold mt-2">23</p>
                  <p className="text-xs text-muted-foreground mt-1">in current month</p>
                </div>
                <Calendar className="h-10 w-10 text-pink-500 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Usage Chart */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-4">Daily Token Usage</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    labelStyle={{ color: "#f3f4f6" }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    dot={{ fill: "#667eea", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Content Type Distribution */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Content Types</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Platform Usage */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Platform-wise Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="platform" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Bar dataKey="usage" fill="#667eea" name="Used" />
                <Bar dataKey="limit" fill="#e5e7eb" name="Limit" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Usage Summary Table */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Metric</th>
                    <th className="text-right py-3 px-4 font-semibold">This Month</th>
                    <th className="text-right py-3 px-4 font-semibold">Last Month</th>
                    <th className="text-right py-3 px-4 font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">Total Tokens Used</td>
                    <td className="text-right py-3 px-4">13,230</td>
                    <td className="text-right py-3 px-4">11,450</td>
                    <td className="text-right py-3 px-4 text-green-600">+15.5%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">Content Generated</td>
                    <td className="text-right py-3 px-4">378</td>
                    <td className="text-right py-3 px-4">312</td>
                    <td className="text-right py-3 px-4 text-green-600">+21.2%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">Avg Tokens per Content</td>
                    <td className="text-right py-3 px-4">35</td>
                    <td className="text-right py-3 px-4">37</td>
                    <td className="text-right py-3 px-4 text-green-600">-5.4%</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="py-3 px-4">Active Days</td>
                    <td className="text-right py-3 px-4">28</td>
                    <td className="text-right py-3 px-4">26</td>
                    <td className="text-right py-3 px-4 text-green-600">+7.7%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
