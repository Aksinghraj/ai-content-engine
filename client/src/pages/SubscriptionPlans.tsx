import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Check,
  Crown,
  Zap,
  Shield,
  Star,
  Building2,
  ArrowRight,
  Sparkles,
  Lock,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PLAN_ICONS: Record<string, any> = {
  free: Zap,
  pro_monthly: Crown,
  pro_yearly: Star,
  enterprise: Building2,
};

const PLAN_COLORS: Record<string, string> = {
  free: "from-slate-500 to-slate-600",
  pro_monthly: "from-purple-500 to-violet-600",
  pro_yearly: "from-amber-500 to-orange-600",
  enterprise: "from-blue-600 to-indigo-700",
};

export default function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: plans, isLoading: plansLoading } = trpc.subscription.getPlans.useQuery();
  const { data: status, refetch: refetchStatus } = trpc.subscription.getStatus.useQuery();
  const createOrder = trpc.subscription.createOrder.useMutation();
  const verifyPayment = trpc.subscription.verifyPayment.useMutation();

  const handleSubscribe = async (planId: "pro_monthly" | "pro_yearly") => {
    setProcessingPlan(planId);

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        return;
      }

      // Create order on server
      const order = await createOrder.mutateAsync({ planId });

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Lumae AI",
        description: `${order.planName} Subscription`,
        image: "/logo.png",
        order_id: order.orderId,
        prefill: {
          name: status?.tier ? "Lumae User" : "",
          email: "",
        },
        theme: {
          color: "#7c3aed",
          backdrop_color: "rgba(0,0,0,0.8)",
        },
        modal: {
          ondismiss: () => {
            setProcessingPlan(null);
            toast("Payment cancelled. No charges were made.");
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await verifyPayment.mutateAsync({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId,
            });

            if (result.success) {
              setPaymentSuccess(true);
              await refetchStatus();
              toast.success(result.message || "Subscription activated successfully!");
            }
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed. Please contact support.");
          } finally {
            setProcessingPlan(null);
          }
        },
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment. Please try again.");
      setProcessingPlan(null);
    }
  };

  const filteredPlans = plans?.filter((p) => {
    if (billingCycle === "monthly") return p.id !== "pro_yearly";
    if (billingCycle === "yearly") return p.id !== "pro_monthly";
    return true;
  });

  const isCurrentPlan = (planId: string) => {
    if (planId === "free" && status?.tier === "free") return true;
    if ((planId === "pro_monthly" || planId === "pro_yearly") && status?.tier === "pro") return true;
    return false;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Flexible Plans</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Scale your content creation with AI-powered tools. Upgrade anytime, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* Payment Success Banner */}
        {paymentSuccess && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-300 font-medium">Subscription Activated Successfully!</p>
              <p className="text-green-400/70 text-sm">Your Pro features are now unlocked. Enjoy unlimited AI content generation.</p>
            </div>
          </div>
        )}

        {/* Current Plan Banner */}
        {status && (
          <div className="max-w-2xl mx-auto mb-8 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
            <Crown className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">
                Current Plan: <span className="text-purple-300 capitalize">{status.tier}</span>
              </p>
              <p className="text-gray-400 text-sm">
                {status.isUnlimited
                  ? "Unlimited generations available"
                  : `${status.todayUsage} / ${status.dailyLimit} generations used today`}
              </p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {filteredPlans?.map((plan) => {
              const Icon = PLAN_ICONS[plan.id] || Zap;
              const gradientClass = PLAN_COLORS[plan.id] || "from-gray-500 to-gray-600";
              const isCurrent = isCurrentPlan(plan.id);
              const isProcessing = processingPlan === plan.id;
              const isEnterprise = plan.id === "enterprise";
              const isFeatured = plan.badge === "Most Popular" || plan.badge === "Best Value";

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden border transition-all duration-300 ${
                    isFeatured
                      ? "border-purple-500/50 shadow-xl shadow-purple-500/10 scale-105"
                      : "border-white/10 hover:border-white/20"
                  } bg-white/5 backdrop-blur-sm`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                      <span className={`text-xs font-bold px-4 py-1 rounded-b-lg ${
                        plan.badge === "Best Value"
                          ? "bg-amber-500 text-black"
                          : plan.badge === "Most Popular"
                          ? "bg-purple-600 text-white"
                          : plan.badge === "Contact Us"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className={`pt-${plan.badge ? "8" : "6"}`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>

                    {/* Price */}
                    <div className="mt-2">
                      {plan.monthlyPrice === 0 && plan.id === "free" ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">Free</span>
                          <span className="text-gray-400 text-sm">forever</span>
                        </div>
                      ) : plan.monthlyPrice === 0 && isEnterprise ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-white">Custom</span>
                          <span className="text-gray-400 text-sm">pricing</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-gray-400 text-lg">₹</span>
                          <span className="text-4xl font-bold text-white">{plan.monthlyPrice.toLocaleString()}</span>
                          <span className="text-gray-400 text-sm">/month</span>
                        </div>
                      )}
                      {plan.id === "pro_yearly" && (
                        <p className="text-green-400 text-xs mt-1">
                          ₹{plan.yearlyPrice.toLocaleString()} billed annually
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {isCurrent ? (
                      <Button disabled className="w-full bg-green-600/20 text-green-400 border border-green-500/30 cursor-default">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : isEnterprise ? (
                      <Button
                        variant="outline"
                        className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                        onClick={() => window.open("mailto:enterprise@lumae.ai", "_blank")}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Contact Sales
                      </Button>
                    ) : plan.id === "free" ? (
                      <Button
                        variant="outline"
                        className="w-full border-white/10 text-gray-400 cursor-default"
                        disabled
                      >
                        Get Started Free
                      </Button>
                    ) : (
                      <Button
                        className={`w-full bg-gradient-to-r ${gradientClass} hover:opacity-90 text-white font-semibold shadow-lg`}
                        onClick={() => handleSubscribe(plan.id as "pro_monthly" | "pro_yearly")}
                        disabled={isProcessing || !!processingPlan}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Upgrade Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Security Badges */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <Shield className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">256-bit Encryption</p>
                <p className="text-gray-400 text-xs">AES-GCM end-to-end</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <Lock className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">PCI DSS Compliant</p>
                <p className="text-gray-400 text-xs">Powered by Razorpay</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <AlertCircle className="w-8 h-8 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Instant Refunds</p>
                <p className="text-gray-400 text-xs">7-day money-back guarantee</p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            All payments are processed securely via Razorpay. Your card details are never stored on our servers.
            Prices are in Indian Rupees (INR) and include applicable taxes.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
