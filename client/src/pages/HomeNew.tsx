import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useEffect } from "react";
import {
  Sparkles,
  Zap,
  Flame,
  TrendingUp,
  Settings,
  CreditCard,
  ArrowRight,
  Crown,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function HomeNew() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const subscriptionQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const status = subscriptionQuery.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Content Engine</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {user.name}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Manage your content creation and subscription</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Plan</p>
                  <p className="text-2xl font-bold text-card-foreground capitalize mt-1">
                    {status?.tier || "free"}
                  </p>
                </div>
                {status?.tier === "pro" ? (
                  <Crown className="w-8 h-8 text-yellow-400" />
                ) : (
                  <Zap className="w-8 h-8 text-blue-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Daily Limit</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">
                    {status?.isUnlimited ? "∞" : status?.dailyLimit}
                  </p>
                </div>
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Used Today</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">
                    {status?.todayUsage || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Features</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">
                    {status?.features.length || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Start Creating */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Start Creating Content</CardTitle>
                <CardDescription>
                  Generate high-engagement content in seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/generator")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-6"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Daily Usage (Free tier only) */}
            {status?.tier === "free" && (
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Daily Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Content Generations</span>
                      <span className="text-foreground font-bold">
                        {status?.todayUsage || 0} / {status?.dailyLimit}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        ((status?.todayUsage || 0) / (status?.dailyLimit || 1)) * 100
                      )}
                      className="h-2"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {status && status.dailyLimit - status.todayUsage > 0
                      ? `${status.dailyLimit - status.todayUsage} generations remaining`
                      : "Daily limit reached"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features List */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Your Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {status?.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm capitalize">
                        {feature.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate("/features")}
                  variant="outline"
                  className="w-full mt-4"
                >
                  View All Features
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  {status?.tier === "pro" ? (
                    <>
                      <Crown className="w-5 h-5 text-yellow-400" />
                      Pro Subscription
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-blue-400" />
                      Free Plan
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {status?.tier === "free" && (
                  <>
                    <p className="text-muted-foreground text-sm">
                      Upgrade to Pro for unlimited content generation and automation features.
                    </p>
                    <Button
                      onClick={() => navigate("/payments")}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </>
                )}
                {status?.tier === "pro" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Status</span>
                        <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Renewals</span>
                        <span className="text-foreground text-sm">Monthly</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/payments")}
                      variant="outline"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground text-sm">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => navigate("/generator")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
                <Button
                  onClick={() => navigate("/features")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  All Features
                </Button>
                <Button
                  onClick={() => navigate("/payments")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
