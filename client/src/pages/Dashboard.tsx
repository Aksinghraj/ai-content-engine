import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Zap, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your subscription and usage</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Name</p>
                <p className="text-lg font-semibold text-slate-900">{user.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="text-lg font-semibold text-slate-900">{user.email || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">Current Plan</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status?.tier === "pro" ? "bg-blue-600" : "bg-slate-400"}`} />
                  <span className="text-2xl font-bold text-slate-900 capitalize">
                    {status?.tier}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Daily Limit</p>
                <p className="text-2xl font-bold text-slate-900">
                  {status?.isUnlimited ? "Unlimited" : `${status?.dailyLimit} per day`}
                </p>
              </div>
            </div>

            {status?.tier === "free" && (
              <Button
                onClick={() => navigate("/pricing")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Token Balance (Free tier only) */}
        {status?.tier === "free" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
              <CardDescription>Your available tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Available Tokens</span>
                <span className="text-3xl font-bold text-blue-600">
                  {status?.tokenBalance || 0}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Tokens are used for content generation. Each generation costs 1 token.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Daily Usage (Free tier only) */}
        {status?.tier === "free" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Daily Usage</CardTitle>
              <CardDescription>Your content generation usage today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Used today</span>
                <span className="text-2xl font-bold text-slate-900">
                  {status?.todayUsage || 0} / {status?.dailyLimit}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((status?.todayUsage || 0) / (status?.dailyLimit || 1)) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-slate-600">
                {status && status.dailyLimit - status.todayUsage > 0
                  ? `${status.dailyLimit - status.todayUsage} generations remaining today`
                  : "Daily limit reached. Upgrade to Pro for unlimited access."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pro Subscription Details */}
        {status?.tier === "pro" && details && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Pro Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-600" />
                    <span className="font-semibold text-slate-900 capitalize">
                      {details.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Renewal Date</p>
                  <p className="font-semibold text-slate-900">
                    {details.currentPeriodEnd.toLocaleDateString()}
                  </p>
                </div>
              </div>
              {details.cancelAtPeriodEnd && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Subscription Ending</p>
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on {details.currentPeriodEnd.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {status?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700 capitalize">
                    {feature.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
