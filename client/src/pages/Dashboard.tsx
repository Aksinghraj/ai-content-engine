import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Zap, Calendar, CheckCircle, AlertCircle, ArrowLeft, Crown, Flame, Cog, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation() as any;
  const subscriptionQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const subscriptionDetailsQuery = trpc.subscription.getSubscriptionDetails.useQuery(undefined, {
    enabled: isAuthenticated && user?.subscriptionTier === "pro",
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
  const details = subscriptionDetailsQuery.data;

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
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
          <p className="text-slate-400">Manage your subscription and track your usage</p>
        </div>

        {/* Automation Quick Access */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Cog className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Automation</h3>
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
          <p className="text-slate-300 text-sm">Set up automated content generation schedules for any platform. Generate and post content 24/7 without manual effort.</p>
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
                {status?.tier === "pro" && details && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="font-semibold text-white capitalize">{details.status}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Status</p>
                        <p className="font-semibold text-white">Active</p>
                      </div>
                    </div>
                    {false && (
                      <div className="flex items-start gap-3 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-200">Subscription Ending</p>
                          <p className="text-sm text-yellow-300">Your subscription will end soon</p>
                        </div>
                      </div>
                    )}
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
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  Generate Content
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
