import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Zap,
  Crown,
  Check,
  X,
  ArrowLeft,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Payments() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const subscriptionQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const subscriptionDetailsQuery = trpc.subscription.getSubscriptionDetails.useQuery(void 0, {
    enabled: isAuthenticated && user?.subscriptionTier === "pro",
  });

  const checkoutMutation = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.orderId) {
        toast.success("Payment order created. Razorpay integration coming soon...");
      }
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create payment order");
      setIsProcessing(false);
    },
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
  const details = subscriptionDetailsQuery.data;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    checkoutMutation.mutate({ priceId: "price_pro_monthly" });
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        { name: "5 generations per day", included: true },
        { name: "Basic content types", included: true },
        { name: "Single platform support", included: true },
        { name: "Content history", included: true },
        { name: "Automation", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Current Plan",
      ctaDisabled: user?.subscriptionTier === "free",
      isPro: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For serious content creators",
      features: [
        { name: "Unlimited generations", included: true },
        { name: "All content types", included: true },
        { name: "All platforms", included: true },
        { name: "Content history", included: true },
        { name: "Automation scheduling", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
      ],
      cta: user?.subscriptionTier === "pro" ? "Active Plan" : "Upgrade Now",
      ctaDisabled: user?.subscriptionTier === "pro",
      isPro: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/home")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Billing & Credits
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Usage */}
        {user?.subscriptionTier === "free" && status && (
          <Card className="mb-12 border-slate-700 bg-gradient-to-br from-blue-900/20 to-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Today's Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Content Generations</span>
                  <span className="text-white font-semibold">
                    {status.todayUsage || 0} / {status.dailyLimit}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, ((status.todayUsage || 0) / (status.dailyLimit || 1)) * 100)}
                  className="h-2 bg-slate-700"
                />
              </div>
              <p className="text-sm text-slate-400">
                {status && status.dailyLimit - status.todayUsage > 0
                  ? `${status.dailyLimit - status.todayUsage} generations remaining today`
                  : "Daily limit reached. Upgrade to Pro for unlimited access."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Subscription Status */}
        {user?.subscriptionTier === "pro" && details && (
          <Card className="mb-12 border-slate-700 bg-gradient-to-br from-purple-900/20 to-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Pro Subscription
                </CardTitle>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <p className="text-white font-semibold capitalize">{details.status}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <p className="text-white font-semibold">Active</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Billing Cycle</p>
                  <p className="text-white font-semibold">Monthly</p>
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
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`border-slate-700 backdrop-blur-sm transition-all ${
                  plan.isPro
                    ? "bg-gradient-to-br from-purple-900/20 to-slate-800/50 border-purple-500/30 ring-2 ring-purple-500/20"
                    : "bg-slate-800/50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                    </div>
                    {plan.isPro && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-2">/ {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    onClick={handleUpgrade}
                    disabled={plan.ctaDisabled || isProcessing}
                    className={`w-full font-semibold py-6 ${
                      plan.isPro
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    }`}
                  >
                    {isProcessing ? "Processing..." : plan.cta}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included ? "text-slate-300" : "text-slate-500 line-through"
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user?.subscriptionTier === "pro" ? (
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Pro Monthly Subscription</p>
                      <p className="text-sm text-slate-400">$29.00 / month</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300">Paid</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No billing history yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-12 border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-white font-medium mb-2">Can I cancel anytime?</p>
              <p className="text-slate-400 text-sm">
                Yes, you can cancel your Pro subscription anytime. Your access will continue until the end of your billing cycle.
              </p>
            </div>
            <div>
              <p className="text-white font-medium mb-2">What payment methods do you accept?</p>
              <p className="text-slate-400 text-sm">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.
              </p>
            </div>
            <div>
              <p className="text-white font-medium mb-2">Is there a free trial?</p>
              <p className="text-slate-400 text-sm">
                The Free plan is our trial. Upgrade to Pro anytime to get unlimited features.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
