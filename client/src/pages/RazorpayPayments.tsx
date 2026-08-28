import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertCircle, CheckCircle, Zap, Star, Crown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
  starter: <Zap className="w-6 h-6 text-blue-400" />,
  pro: <Star className="w-6 h-6 text-purple-400" />,
  enterprise: <Crown className="w-6 h-6 text-yellow-400" />,
};

export default function RazorpayPayments() {
  const [processingPackage, setProcessingPackage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ credits: number; packageName: string } | null>(null);

  const { data: packages, isLoading } = trpc.credits.getRazorpayPackages.useQuery();
  const createOrder = trpc.credits.createRazorpayOrder.useMutation();
  const verifyPayment = trpc.credits.verifyRazorpayPayment.useMutation();

  const handlePayment = async (packageId: "starter" | "pro" | "enterprise") => {
    setProcessingPackage(packageId);
    setError(null);

    try {
      // Step 1: Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load payment gateway. Please check your internet connection.");
      }

      // Step 2: Create order on server (gets real Razorpay order_id)
      const order = await createOrder.mutateAsync({ packageId });

      // Step 3: Open Razorpay checkout with real order_id
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Lumae AI",
          description: `${order.packageName} — ${order.credits} Credits`,
          image: "/logo.png",
          order_id: order.orderId,
          prefill: {
            name: "",
            email: "",
            contact: "",
          },
          notes: {
            packageId,
            credits: order.credits,
          },
          theme: {
            color: "#7c3aed",
            backdrop_color: "rgba(0,0,0,0.85)",
          },
          modal: {
            ondismiss: () => {
              toast("Payment cancelled. No charges were made.");
              setProcessingPackage(null);
              resolve();
            },
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // Step 4: Verify signature and add credits
              const result = await verifyPayment.mutateAsync({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageId,
              });

              if (result.success) {
                setSuccess({ credits: result.creditsAdded, packageName: order.packageName });
                toast.success(result.message);
              }
              resolve();
            } catch (err: any) {
              const msg = err.message || "Payment verification failed. Please contact support.";
              setError(msg);
              toast.error(msg);
              reject(err);
            } finally {
              setProcessingPackage(null);
            }
          },
        });

        rzp.on("payment.failed", (response: any) => {
          const msg = response.error?.description || "Payment failed. Please try again.";
          setError(msg);
          toast.error(msg);
          setProcessingPackage(null);
          resolve();
        });

        rzp.open();
      });
    } catch (err: any) {
      const message = err.message || "Failed to initiate payment. Please try again.";
      setError(message);
      toast.error(message);
      setProcessingPackage(null);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-10 max-w-md w-full text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{success.credits} credits</span> from{" "}
              <span className="font-semibold text-foreground">{success.packageName}</span> have been
              added to your account.
            </p>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Buy Credits</h1>
          <p className="text-muted-foreground mt-2">
            Secure payment powered by Razorpay · UPI, Cards, Net Banking &amp; Wallets accepted
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">Payment Error</h3>
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-10 bg-muted rounded w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded w-1/3 mb-6" />
                <div className="h-10 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {packages?.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative flex min-h-[300px] flex-col p-6 ${
                  pkg.popular
                    ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/10"
                    : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  {PACKAGE_ICONS[pkg.id]}
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                </div>

                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  ₹{pkg.priceINR.toLocaleString("en-IN")}
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  {pkg.credits.toLocaleString()} credits ·{" "}
                  ₹{(pkg.priceINR / pkg.credits).toFixed(2)}/credit
                </p>

                <Button
                  onClick={() => handlePayment(pkg.id as "starter" | "pro" | "enterprise")}
                  disabled={processingPackage !== null}
                  className="mt-auto w-full border border-primary/40 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white hover:opacity-90"
                  variant="default"
                >
                  {processingPackage === pkg.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Opening checkout...
                    </span>
                  ) : (
                    `Buy ${pkg.credits} Credits`
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6 bg-muted/40">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Secure payment verification</p>
              <p>
                Payments are processed by Razorpay. Credits are added only after Lumae verifies the provider payment for your signed-in account.
              </p>
              <p>
                Supported: UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, Net Banking, Wallets.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
