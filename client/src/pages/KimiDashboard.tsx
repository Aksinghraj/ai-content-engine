import { usePageAnimation, useCardAnimations } from "@/hooks/useAnimation";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

function KimiDashboardContent() {
  const [, setLocation] = useLocation();
  const pageAnimation = usePageAnimation();
  const cardAnimations = useCardAnimations(8);
  const [gradient, setGradient] = useState("from-purple-600 via-pink-600 to-red-600");

  useEffect(() => {
    setGradient(getRandomGradient());
  }, []);

  const stats = [
    {
      icon: MessageSquare,
      label: "Total Posts",
      value: "1,248",
      change: "+12%",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      label: "Engagement Rate",
      value: "8.4%",
      change: "+2.3%",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: BarChart3,
      label: "Total Reach",
      value: "245K",
      change: "+18%",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      label: "Active Automations",
      value: "12",
      change: "+3",
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

  const recentPosts = [
    {
      title: "Excited to announce our new AI features!",
      platform: "Instagram",
      engagement: 2847,
      status: "Posted",
      time: "2 hours ago",
    },
    {
      title: "Check out our latest blog post on content strategy",
      platform: "LinkedIn",
      engagement: 1523,
      status: "Posted",
      time: "4 hours ago",
    },
    {
      title: "New video tutorial: How to use our platform",
      platform: "YouTube",
      engagement: 5234,
      status: "Scheduled",
      time: "Tomorrow at 2 PM",
    },
  ];

  return (
    <div className="relative min-h-full">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Page Header */}
        <div className={`${pageAnimation.className} flex items-center justify-between mb-8`}>
          <div>
            <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your content</p>
          </div>
          <Button
            onClick={() => setLocation("/post-scheduling")}
            className={`bg-gradient-to-r ${gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${cardAnimations[index] || "animate-fade-scale"} group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className={`${pageAnimation.className} text-xl font-bold mb-5`}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => setLocation(action.href)}
                  className={`${cardAnimations[index] || "animate-fade-scale"} group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg text-left overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-semibold text-sm leading-tight">{action.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h2 className={`${pageAnimation.className} text-xl font-bold mb-5`}>Recent Posts</h2>
          <div className="space-y-3">
            {recentPosts.map((post, index) => (
              <div
                key={index}
                className={`${cardAnimations[index] || "animate-fade-scale"} group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold mb-2 truncate">{post.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {post.platform}
                      </span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold">{post.engagement.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">engagement</div>
                    <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      post.status === "Posted"
                        ? "bg-green-500/15 text-green-600"
                        : "bg-blue-500/15 text-blue-600"
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
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
