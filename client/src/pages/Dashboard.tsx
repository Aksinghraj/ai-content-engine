import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Zap, CheckCircle, AlertCircle, ArrowLeft, Crown, Flame, Cog, Plus, Sparkles, Brain, ArrowRight, Wand2, Play, TrendingUp, BookmarkPlus, ChevronDown, ChevronUp, BarChart3, Download, Filter } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [expandedTrend, setExpandedTrend] = useState<number | null>(null);
  const [contentFilter, setContentFilter] = useState<"all" | "recent" | "top">("recent");
  const subscriptionQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: contentHistory, isLoading: contentLoading } = trpc.content.history.useQuery(undefined);
  const { data: credits, isLoading: creditsLoading } = trpc.credits.getBalance.useQuery(undefined);
  const { data: generationStats } = trpc.credits.getGenerationStats.useQuery(undefined);
  const { data: transactionHistory } = trpc.credits.getTransactionHistory.useQuery({ limit: 10 });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const status = subscriptionQuery.data;

  // Mock saved trends data (in production, this would come from tRPC)
  const mockSavedTrends = [
    {
      id: 1,
      title: "#AIRevolution",
      score: 94,
      growth: 156,
      category: "Technology",
      reach: "2.5M",
      platforms: ["TikTok", "Instagram", "Twitter"],
      keywords: ["AI", "Machine Learning", "ChatGPT", "Automation"],
      hooks: ["The AI takeover is here...", "This AI feature just changed everything..."],
    },
    {
      id: 2,
      title: "#SideHustleLife",
      score: 87,
      growth: 124,
      category: "Business",
      reach: "1.8M",
      platforms: ["Instagram", "YouTube", "LinkedIn"],
      keywords: ["Passive Income", "Entrepreneurship", "Freelance"],
      hooks: ["I made $5k this week with this...", "The best side hustle in 2026..."],
    },
    {
      id: 3,
      title: "#WellnessJourney",
      score: 79,
      growth: 98,
      category: "Health",
      reach: "1.2M",
      platforms: ["TikTok", "Instagram"],
      keywords: ["Mental Health", "Fitness", "Meditation"],
      hooks: ["This wellness hack changed my life...", "5 things I do every morning..."],
    },
  ];

  // Filter content history
  const filteredContent = contentHistory ? [...contentHistory].sort((a, b) => {
    if (contentFilter === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  }).slice(0, 6) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
          <p className="text-slate-400">Manage your subscription and track your usage</p>
        </div>

        {/* ===== HIGHLIGHTED GENERATE CONTENT CTA ===== */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-[2px]">
          <div className="rounded-2xl bg-slate-900/90 backdrop-blur-sm p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Generate Content</h3>
                  <p className="text-slate-300 mt-1">Create viral, engaging content instantly with AI</p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/generator")}
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* ===== PERSONAL AI SECTION ===== */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Your Personal AI</h3>
                <p className="text-sm text-slate-300">Chat with your AI that learns your style and helps create content</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/personal-ai")}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold px-6"
            >
              <Brain className="w-4 h-4 mr-2" />
              Chat with AI
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* ===== SOCIAL MEDIA AUTOMATION ===== */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600/20 via-orange-600/20 to-yellow-600/20 border border-pink-500/30 backdrop-blur-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Social Media Automation</h3>
                <p className="text-sm text-slate-300">Connect accounts, auto-post, and reply to comments with AI</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/social-automation")}
              className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:from-pink-600 hover:via-orange-600 hover:to-yellow-600 text-white font-semibold px-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              Manage Social Accounts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Automation Quick Access */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Cog className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Content Automation</h3>
                <p className="text-sm text-slate-300">Schedule content generation automatically</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/automations")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </div>
        </div>

        {/* Demo Videos Section */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border border-cyan-500/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Watch Demo Videos</h3>
                <p className="text-sm text-slate-300">Learn how to use Lumae AI - Available in 10+ languages</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/demo-videos")}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Account Info Card */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Account Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white truncate">{user.email || "Not set"}</p>
              <p className="text-xs text-slate-500 mt-2">Primary account email</p>
            </CardContent>
          </Card>

          {/* Plan Card */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                {status?.tier === "pro" ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-400" />
                    Current Plan
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-blue-400" />
                    Current Plan
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white capitalize">{status?.tier}</p>
              <p className="text-xs text-slate-500 mt-2">
                {status?.tier === "pro" ? "Unlimited access" : "Limited access"}
              </p>
            </CardContent>
          </Card>

          {/* Generations Card */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Daily Limit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {status?.isUnlimited ? "∞" : status?.dailyLimit}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {status?.isUnlimited ? "Unlimited per day" : "generations per day"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Status Card */}
            <Card className={`border-slate-700 backdrop-blur-sm ${
              status?.tier === "pro"
                ? "bg-gradient-to-br from-blue-900/20 to-slate-800/50 border-blue-500/30"
                : "bg-slate-800/50"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {status?.tier === "pro" ? (
                      <>
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">Pro Subscription</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span className="text-white">Free Plan</span>
                      </>
                    )}
                  </CardTitle>
                  <Badge className={status?.tier === "pro" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-slate-700 text-slate-300"}>
                    {status?.tier === "pro" ? "Active" : "Current"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {status?.tier === "free" && (
                  <>
                    <p className="text-slate-400">
                      You're on the Free plan. Upgrade to Pro to unlock unlimited content generation and automation features.
                    </p>
                    <Button
                      onClick={() => navigate("/pricing")}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </>
                )}
                {status?.tier === "pro" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="font-semibold text-white">Active</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Renewal</p>
                        <p className="font-semibold text-white">Monthly</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Card (Free tier only) */}
            {status?.tier === "free" && (
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Daily Usage</CardTitle>
                  <CardDescription className="text-slate-400">Your content generation usage today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Used today</span>
                    <span className="text-2xl font-bold text-white">
                      {status?.todayUsage || 0} / {status?.dailyLimit}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, ((status?.todayUsage || 0) / (status?.dailyLimit || 1)) * 100)}
                    className="h-2 bg-slate-700"
                  />
                  <p className="text-sm text-slate-400">
                    {status && status.dailyLimit - status.todayUsage > 0
                      ? `${status.dailyLimit - status.todayUsage} generations remaining today`
                      : "Daily limit reached. Upgrade to Pro for unlimited access."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features List */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Available Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {status?.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm capitalize">
                        {feature.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Token Balance (Free tier only) */}
            {status?.tier === "free" && (
              <Card className="border-slate-700 bg-gradient-to-br from-blue-900/20 to-slate-800/50 backdrop-blur-sm border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    Token Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-400 mb-2">
                      {status?.tokenBalance || 0}
                    </p>
                    <p className="text-sm text-slate-400">Available tokens</p>
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Each generation costs 1 token. Tokens reset daily.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pro Benefits */}
            {status?.tier === "pro" && (
              <Card className="border-slate-700 bg-gradient-to-br from-purple-900/20 to-slate-800/50 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Pro Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Unlimited generations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Automation scheduling</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Advanced analytics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Priority support</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => navigate("/generator")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
                <Button
                  onClick={() => navigate("/personal-ai")}
                  variant="outline"
                  className="w-full border-violet-500/50 text-violet-300 hover:text-white hover:bg-violet-600/20"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Personal AI Chat
                </Button>
                <Button
                  onClick={() => navigate("/pricing")}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Trends Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Trending Topics
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/trending")}
              className="text-purple-400 border-purple-500/30 hover:border-purple-500/60"
            >
              View All Trends
            </Button>
          </div>

          <div className="space-y-3">
            {mockSavedTrends.map((trend) => (
              <div
                key={trend.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all"
              >
                {/* Trend Header */}
                <button
                  onClick={() => setExpandedTrend(expandedTrend === trend.id ? null : trend.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <div>
                        <h3 className="font-bold text-lg text-white">{trend.title}</h3>
                        <p className="text-slate-400 text-sm">{trend.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mr-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-400 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        +{trend.growth}%
                      </div>
                      <p className="text-slate-400 text-sm">Trend Score: {trend.score}</p>
                    </div>
                    {expandedTrend === trend.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedTrend === trend.id && (
                  <div className="border-t border-slate-700 p-4 bg-slate-900/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Platforms</p>
                        <div className="flex flex-wrap gap-2">
                          {trend.platforms.map((platform) => (
                            <span
                              key={platform}
                              className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-slate-400 text-sm mb-2">Estimated Reach</p>
                        <p className="text-xl font-bold text-blue-400">{trend.reach}</p>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-slate-400 text-sm mb-2">Related Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {trend.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-slate-400 text-sm mb-2">Suggested Hooks</p>
                        <ul className="space-y-2">
                          {trend.hooks.map((hook, idx) => (
                            <li key={idx} className="text-slate-300 text-sm flex gap-2">
                              <span className="text-purple-400">•</span>
                              {hook}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <Button
                        size="sm"
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => navigate("/generator")}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Content
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 hover:bg-slate-800"
                      >
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generated Content Gallery */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Your Generated Content
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={contentFilter === "recent" ? "default" : "outline"}
                onClick={() => setContentFilter("recent")}
                className={contentFilter === "recent" ? "bg-purple-600" : ""}
              >
                Recent
              </Button>
              <Button
                size="sm"
                variant={contentFilter === "top" ? "default" : "outline"}
                onClick={() => setContentFilter("top")}
                className={contentFilter === "top" ? "bg-purple-600" : ""}
              >
                Top Performing
              </Button>
            </div>
          </div>

          {contentLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading your content...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No content generated yet</p>
                <Button
                  onClick={() => navigate("/generator")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Create Your First Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((content: any) => {
                const parsedContent = typeof content.generatedContent === "string"
                  ? JSON.parse(content.generatedContent)
                  : content.generatedContent;

                return (
                  <Card key={content.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:border-purple-500/30 transition-all">
                    <CardContent className="pt-6">
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-1">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold text-purple-400 capitalize">
                          {content.platform}
                        </p>
                      </div>

                      <p className="text-slate-300 text-sm line-clamp-3 mb-4">
                        {parsedContent?.text || parsedContent?.caption || "Generated content"}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs border-slate-600 hover:bg-slate-700"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              parsedContent?.text || parsedContent?.caption || ""
                            );
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs border-slate-600 hover:bg-slate-700"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Credit Usage Analytics */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Credit Usage
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Balance Card */}
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-slate-800/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-slate-400 text-sm mb-2">Total Balance</p>
                <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                  {credits?.balance || 0}
                </p>
                <p className="text-slate-400 text-sm">
                  {credits?.totalPurchased || 0} purchased • {credits?.totalUsed || 0} used
                </p>
              </CardContent>
            </Card>

            {/* Purchased Card */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-slate-400 text-sm mb-2">Total Purchased</p>
                <p className="text-4xl font-bold text-blue-400">{credits?.totalPurchased || 0}</p>
                <p className="text-slate-400 text-sm mt-2">credits</p>
              </CardContent>
            </Card>

            {/* Used Card */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-slate-400 text-sm mb-2">Total Used</p>
                <p className="text-4xl font-bold text-orange-400">{credits?.totalUsed || 0}</p>
                <p className="text-slate-400 text-sm mt-2">credits</p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          {transactionHistory && transactionHistory.length > 0 && (
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactionHistory.slice(0, 5).map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                    >
                      <div>
                        <p className="font-semibold text-white capitalize">
                          {transaction.type === "purchase" && "✓ Purchase"}
                          {transaction.type === "usage" && "✗ Usage"}
                          {transaction.type === "refund" && "↶ Refund"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === "usage"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}>
                        {transaction.type === "usage" ? "-" : "+"}
                        {transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
