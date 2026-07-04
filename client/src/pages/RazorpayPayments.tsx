import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Lock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
}

const paymentPackages: PaymentPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 4.99,
    description: "Perfect for testing",
  },
  {
    id: "growth",
    name: "Growth",
    credits: 500,
    price: 19.99,
    description: "Most popular",
    popular: true,
  },
  {
    id: "professional",
    name: "Professional",
    credits: 1000,
    price: 39.99,
    description: "For professionals",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 5000,
    price: 149.99,
    description: "For teams",
  },
];

export default function RazorpayPayments() {
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async (pkg: PaymentPackage) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSelectedPackage(pkg);

      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: pkg.price * 100, // Amount in paise
        currency: "INR",
        name: "Lumae AI",
        description: `Purchase ${pkg.credits} credits`,
        image: "/logo.png",
        handler: async (response: any) => {
          // Verify payment on backend
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
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 2000);
          } else {
            setError("Payment verification failed");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        notes: {
          packageId: pkg.id,
          credits: pkg.credits,
        },
        theme: {
          color: "#9333ea",
        },
      };

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError("Failed to initiate payment");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomPayment = async () => {
    if (!customAmount || parseFloat(customAmount) < 1) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: parseFloat(customAmount) * 100,
        currency: "INR",
        name: "Lumae AI",
        description: `Purchase credits`,
        image: "/logo.png",
        handler: async (response: any) => {
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
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 2000);
          } else {
            setError("Payment verification failed");
          }
        },
        theme: {
          color: "#9333ea",
        },
      };

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError("Failed to initiate payment");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Buy Credits</h1>
          <p className="text-gray-600 mt-2">Secure payment powered by Razorpay</p>
        </div>

        {/* Security Features */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Enterprise Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>End-to-end encryption (AES-256-GCM)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>PCI DSS Level 1 compliance</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>HMAC-SHA256 webhook verification</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Secure credential tokenization</span>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Packages */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Choose a Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id
                    ? "ring-2 ring-purple-500 border-purple-500"
                    : "hover:shadow-lg"
                } ${pkg.popular ? "relative" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">₹{pkg.price}</div>
                    <div className="text-sm text-gray-600">{pkg.credits} credits</div>
                  </div>
                  <Button
                    onClick={() => handlePayment(pkg)}
                    disabled={isProcessing}
                    className={`w-full ${
                      pkg.popular ? "bg-purple-600 hover:bg-purple-700" : ""
                    }`}
                  >
                    {isProcessing && selectedPackage?.id === pkg.id ? "Processing..." : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Amount</CardTitle>
            <CardDescription>Purchase any amount of credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Amount (₹)</Label>
              <Input
                id="custom-amount"
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button onClick={handleCustomPayment} disabled={isProcessing} className="w-full">
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How are credits calculated?</h4>
              <p className="text-sm text-gray-600">1 credit = 1 API call or content generation</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is my payment secure?</h4>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Yes, we use enterprise-grade encryption and PCI DSS compliance
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I get a refund?</h4>
              <p className="text-sm text-gray-600">
                Refunds are available within 7 days of purchase. Contact support for details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
