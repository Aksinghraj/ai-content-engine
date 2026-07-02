import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function SimpleDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to access your Dashboard</h2>
          <p className="text-slate-400 mb-6">You need to be logged in to view this page.</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Sparkles,
      label: "Generate Content",
      description: "Create AI-powered posts",
      href: "/generator",
      color: "from-purple-600 to-pink-600",
    },
    {
      icon: Calendar,
      label: "Schedule Posts",
      description: "Plan your content",
      href: "/post-scheduling",
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: Zap,
      label: "Automation",
      description: "Auto-post to platforms",
      href: "/automation",
      color: "from-green-600 to-teal-600",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      description: "Track performance",
      href: "/analytics",
      color: "from-orange-600 to-red-600",
    },
    {
      icon: MessageSquare,
      label: "AI Assistant",
      description: "Get AI help",
      href: "/personal-ai",
      color: "from-indigo-600 to-purple-600",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Manage accounts",
      href: "/settings",
      color: "from-slate-600 to-slate-700",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">{user.name || "Creator"}</span>
          </h1>
          <p className="text-slate-400 text-lg">
            You have <span className="text-purple-400 font-semibold">{user.tokenBalance || 0} tokens</span> remaining
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => navigate(action.href)}
                  className="group p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:bg-slate-900/80 text-left"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{action.label}</h3>
                  <p className="text-slate-400 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold group-hover:gap-3 transition-all">
                    Open <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Email Verified</p>
                <div className={`w-3 h-3 rounded-full ${user.emailVerified ? "bg-green-500" : "bg-yellow-500"}`} />
              </div>
              <p className="text-2xl font-bold">{user.emailVerified ? "Yes" : "Pending"}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <p className="text-slate-400 mb-2">Account Type</p>
              <p className="text-2xl font-bold capitalize">{user.subscriptionTier || "Free"}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
