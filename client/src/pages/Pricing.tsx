import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const createCheckoutMutation = trpc.subscription.createCheckoutSession.useMutation();

  const handleUpgradeToPro = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to upgrade");
      return;
    }

    try {
      // Using a test price ID - replace with actual Stripe price ID
      const result = await createCheckoutMutation.mutateAsync({
        priceId: "price_1234567890", // Replace with actual Stripe price ID
      });

      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (error) {
      toast.error("Failed to start checkout");
      console.error(error);
    }
  };

  const freeFeatures = [
    "5 content generations per day",
    "Basic content generation",
    "10 saved content packages",
    "Copy-to-clipboard functionality",
    "Email support",
  ];

  const proFeatures = [
    "Unlimited content generations",
    "Advanced content generation",
    "Unlimited saved content packages",
    "Automation & scheduling",
    "Batch content generation",
    "Advanced analytics",
    "Priority support",
    "Custom templates",
    "API access",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Choose the perfect plan for your content creation needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="relative border-2 border-slate-200 hover:border-slate-300 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600 ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                disabled
                variant="outline"
                className="w-full"
              >
                {user?.subscriptionTier === "free" ? "Current Plan" : "Get Started"}
              </Button>

              <div className="space-y-4">
                <p className="font-semibold text-slate-900">Includes:</p>
                <ul className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="relative border-2 border-blue-600 shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For serious content creators</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">$29</span>
                <span className="text-slate-600 ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleUpgradeToPro}
                disabled={createCheckoutMutation.isPending || user?.subscriptionTier === "pro"}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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

              <div className="space-y-4">
                <p className="font-semibold text-slate-900">Includes everything in Free, plus:</p>
                <ul className="space-y-3">
                  {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600">
                Yes! You can cancel your Pro subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Do you offer refunds?</h3>
              <p className="text-slate-600">
                We offer a 7-day money-back guarantee if you're not satisfied with Pro. Contact support for more details.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-slate-600">
                Absolutely! You can upgrade to Pro or downgrade to Free at any time. Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
