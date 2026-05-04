import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const createCheckoutMutation = trpc.subscription.createCheckoutSession.useMutation();

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to upgrade");
      return;
    }

    try {
      const result = await createCheckoutMutation.mutateAsync({
        priceId: "price_1234567890",
      });

      if (result.orderId) {
        toast.success("Payment order created. Razorpay integration coming soon...");
      }
    } catch (error) {
      toast.error("Failed to start checkout");
      console.error(error);
    }
  };

  const features = [
    { name: "Content Generations", free: "5/day", pro: "Unlimited", icon: "⚡" },
    { name: "Viral Ideas", free: "10", pro: "10", icon: "🔥" },
    { name: "Hooks Generation", free: "✓", pro: "✓", icon: "🎯" },
    { name: "Script Writing", free: "✓", pro: "✓", icon: "🎬" },
    { name: "Caption Generation", free: "✓", pro: "✓", icon: "📝" },
    { name: "Hashtag Research", free: "✓", pro: "✓", icon: "🔎" },
    { name: "Carousel Outlines", free: "✓", pro: "✓", icon: "🎠" },
    { name: "Content Repurposing", free: "✓", pro: "✓", icon: "🔁" },
    { name: "Optimization Tips", free: "✓", pro: "✓", icon: "🚀" },
    { name: "Content History", free: "30 days", pro: "Unlimited", icon: "📚" },
    { name: "Automation Scheduling", free: "✗", pro: "✓", icon: "⏰" },
    { name: "Scheduled Execution", free: "✗", pro: "✓", icon: "🤖" },
    { name: "Advanced Analytics", free: "✗", pro: "✓", icon: "📊" },
    { name: "Priority Support", free: "✗", pro: "✓", icon: "🎧" },
    { name: "API Access", free: "✗", pro: "Coming Soon", icon: "🔌" },
  ];

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
            <h1 className="text-xl font-bold text-white">Pricing Plans</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choose the perfect plan for your content creation needs. Start free, upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Tier */}
          <Card className="relative border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-400" />
                  Free
                </CardTitle>
                {user?.subscriptionTier === "free" && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    Current Plan
                  </Badge>
                )}
              </div>
              <CardDescription className="text-slate-400">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <p className="text-slate-400">Forever free, no credit card required</p>
              </div>

              <Button
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                disabled={user?.subscriptionTier === "free"}
              >
                {user?.subscriptionTier === "free" ? "Current Plan" : "Get Started"}
              </Button>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">5 generations per day</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">All core features included</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">30-day content history</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">No automation</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">No advanced analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="relative border-blue-500 bg-gradient-to-br from-blue-900/20 to-slate-800/50 backdrop-blur-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
              Most Popular
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Pro
                </CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                For serious content creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold text-white mb-2">
                  $29<span className="text-lg text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">Billed monthly, cancel anytime</p>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={createCheckoutMutation.isPending || user?.subscriptionTier === "pro"}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
              >
                {user?.subscriptionTier === "pro" ? (
                  "Current Plan"
                ) : createCheckoutMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Unlimited generations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">All core features included</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Unlimited content history</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Automation scheduling</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Priority support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-6">Detailed Feature Comparison</h3>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-400">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {features.map((feature, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-300 flex items-center gap-2">
                        <span>{feature.icon}</span>
                        {feature.name}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-400">{feature.free}</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-300">{feature.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <h4 className="font-semibold text-white mb-2">Can I cancel anytime?</h4>
              <p className="text-slate-400">Yes, you can cancel your Pro subscription at any time with no penalties or hidden fees.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <h4 className="font-semibold text-white mb-2">Do you offer refunds?</h4>
              <p className="text-slate-400">We offer a 7-day money-back guarantee if you're not satisfied with Pro.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <h4 className="font-semibold text-white mb-2">Can I switch plans?</h4>
              <p className="text-slate-400">Yes, upgrade or downgrade at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <h4 className="font-semibold text-white mb-2">What payment methods do you accept?</h4>
              <p className="text-slate-400">We accept all major credit cards via Stripe. Your payment information is secure and encrypted.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
