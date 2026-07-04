import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const PAYMENT_PACKAGES: PaymentPackage[] = [
  { id: "starter", name: "Starter", credits: 100, price: 499 },
  { id: "pro", name: "Pro", credits: 500, price: 1999, popular: true },
  { id: "enterprise", name: "Enterprise", credits: 2000, price: 5999 },
];

export default function RazorpayPayments() {
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
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

  const handlePayment = async (pkg: PaymentPackage) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSelectedPackage(pkg);

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Payment service not configured");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      const options = {
        key: razorpayKey,
        amount: pkg.price * 100,
        currency: "INR",
        name: "Lumae AI",
        description: `Purchase ${pkg.credits} credits`,
        image: "/logo.png",
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                packageId: pkg.id,
              }),
            });

            if (verifyResponse.ok) {
              setSuccess(true);
              toast.success("Payment successful! Credits added to your account.");
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 2000);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            setError("Payment verification failed");
            toast.error("Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "User",
          email: "",
          contact: "",
        },
        notes: {
          packageId: pkg.id,
          credits: pkg.credits,
        },
        theme: {
          color: "#9333ea",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      setIsProcessing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initiate payment";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
    }
  };

  const handleCustomPayment = async () => {
    if (!customAmount || parseFloat(customAmount) < 100) {
      setError("Minimum amount is ₹100");
      toast.error("Minimum amount is ₹100");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Payment service not configured");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      const options = {
        key: razorpayKey,
        amount: parseFloat(customAmount) * 100,
        currency: "INR",
        name: "Lumae AI",
        description: "Purchase credits",
        image: "/logo.png",
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                customAmount: parseFloat(customAmount),
              }),
            });

            if (verifyResponse.ok) {
              setSuccess(true);
              toast.success("Payment successful! Credits added to your account.");
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 2000);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            setError("Payment verification failed");
            toast.error("Payment verification failed");
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#9333ea",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      setIsProcessing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initiate payment";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 max-w-md w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your credits have been added to your account.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Buy Credits</h1>
          <p className="text-gray-600 mt-2">Secure payment powered by Razorpay</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Payment Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PAYMENT_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className={`p-6 ${pkg.popular ? "ring-2 ring-purple-500" : ""}`}>
              {pkg.popular && (
                <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold w-fit mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <p className="text-3xl font-bold text-purple-600 mb-4">₹{pkg.price}</p>
              <p className="text-gray-600 mb-6">{pkg.credits} credits</p>
              <Button
                onClick={() => handlePayment(pkg)}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing && selectedPackage?.id === pkg.id ? "Processing..." : "Buy Now"}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Custom Amount</h3>
          <div className="flex gap-2">
            <input
              type="number"
              min="100"
              placeholder="Enter amount in ₹"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <Button onClick={handleCustomPayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
