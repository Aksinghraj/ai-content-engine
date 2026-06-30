import { getRandomGradient, getRandomAnimation } from "@/lib/animationUtils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  BarChart3,
  Zap,
  MessageSquare,
  TrendingUp,
  Calendar,
  Brain,
  Sparkles,
  ArrowUpRight,
  Settings,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";

function KimiDashboardContent() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [gradient, setGradient] = useState("from-purple-600 via-pink-600 to-red-600");
  const cardAnimations = Array(8).fill("");

  useEffect(() => {
    setGradient(getRandomGradient());
  }, []);

  // Empty stats - no fake data
  const stats = [
    {
      icon: MessageSquare,
      label: "Total Posts",
      value: "0",
      change: "—",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      label: "Engagement Rate",
      value: "—",
      change: "—",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: BarChart3,
      label: "Total Reach",
      value: "0",
      change: "—",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      label: "Active Automations",
      value: "0",
      change: "—",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const quickActions = [
    {
      icon: Calendar,
      label: "Schedule Post",
      href: "/post-scheduling",
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: Zap,
      label: "Social Automation",
      href: "/social-automation",
      color: "from-purple-600 to-pink-600",
    },
    {
      icon: Brain,
      label: "AI Assistant",
      href: "/personal-ai",
      color: "from-green-600 to-teal-600",
    },
    {
      icon: Sparkles,
      label: "Generate Content",
      href: "/generator",
      color: "from-orange-600 to-red-600",
    },
    {
      icon: Settings,
      label: "OAuth Settings",
      href: "/oauth-settings",
      color: "from-indigo-600 to-purple-600",
    },
  ];

  // Empty recent posts - no fake data
  const recentPosts = [];

  return (
    <div className="relative min-h-full">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.name || "User"}!</h1>
          <p className="text-slate-400 text-lg">Your personal content creation workspace</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-white border-opacity-10 backdrop-blur-sm hover:border-opacity-20 transition-all duration-300 ${cardAnimations[index]}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-5 h-5 text-white opacity-70" />
                </div>
                <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <span className="text-xs text-slate-500">{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={() => setLocation(action.href)}
                  className={`h-auto p-6 flex flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br ${action.color} hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-white font-semibold`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm text-center">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Empty State for Recent Posts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Posts</h2>
          <div className="p-12 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm text-center">
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-slate-400 mb-6">Start creating and scheduling content to see your posts here</p>
            <Button
              onClick={() => setLocation("/generator")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Your First Post
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
            <Brain className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Accounts</h3>
            <p className="text-slate-300 mb-4">Link your social media accounts to start automating content posting</p>
            <Button
              onClick={() => setLocation("/social-automation")}
              variant="outline"
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
            >
              Connect Accounts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="p-8 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Generate Content</h3>
            <p className="text-slate-300 mb-4">Use AI to create viral-worthy content tailored to your audience</p>
            <Button
              onClick={() => setLocation("/generator")}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              Start Generating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KimiDashboard() {
  return (
    <DashboardLayout>
      <KimiDashboardContent />
    </DashboardLayout>
  );
}
