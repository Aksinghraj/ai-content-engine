import { usePageAnimation, useCardAnimations, useSequentialAnimations } from "@/hooks/useAnimation";
import { getRandomGradient, getRandomAnimation, getPageAnimationConfig } from "@/lib/animationUtils";
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
} from "lucide-react";
import { useEffect, useState } from "react";

export default function KimiDashboard() {
  const [, setLocation] = useLocation();
  const pageAnimation = usePageAnimation();
  const cardAnimations = useCardAnimations(6);
  const [gradient, setGradient] = useState("from-purple-600 via-pink-600 to-red-600");
  const [headerAnimation, setHeaderAnimation] = useState("slide-top");

  useEffect(() => {
    setGradient(getRandomGradient());
    setHeaderAnimation(getRandomAnimation());
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className={`${pageAnimation.className} border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-40`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome back! 👋</h1>
                <p className="text-gray-400 mt-1">Here's what's happening with your content</p>
              </div>
              <Button
                onClick={() => setLocation("/post-scheduling")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`${cardAnimations[index] || "animate-fade-scale"} group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm`}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                        <ArrowUpRight className="w-4 h-4" />
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className={`${pageAnimation.className} text-2xl font-bold text-white mb-6`}>Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setLocation(action.href)}
                    className={`${cardAnimations[index] || "animate-fade-scale"} group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm text-left`}
                  >
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}></div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
                        style={{
                          backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        }}
                      >
                        {action.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Posts */}
          <div>
            <h2 className={`${pageAnimation.className} text-2xl font-bold text-white mb-6`}>Recent Posts</h2>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <div
                  key={index}
                  className={`${cardAnimations[index] || "animate-fade-scale"} group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm`}
                >
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-2">{post.title}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                            {post.platform}
                          </span>
                          <span>{post.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{post.engagement}</div>
                        <div className="text-xs text-gray-400">engagement</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div></div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        post.status === "Posted"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Blob animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
