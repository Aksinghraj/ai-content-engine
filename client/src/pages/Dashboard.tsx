import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Zap, CheckCircle, AlertCircle, ArrowLeft, Crown, Flame, Cog, Plus, Sparkles, Brain, ArrowRight, Wand2, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const subscriptionQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const status = subscriptionQuery.data;

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
                <p className="text-sm text-slate-300">Learn how to use AI Content Engine - Available in 10+ languages</p>
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
      </main>
    </div>
  );
}
