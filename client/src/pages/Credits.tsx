import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Coins, ShoppingCart, TrendingUp, History, Loader2, Check, AlertCircle } from "lucide-react";

export default function Credits() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch credit balance
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch credit packages
  const { data: packages, isLoading: packagesLoading } = trpc.credits.getPackages.useQuery();

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = trpc.credits.getTransactionHistory.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );

  // Create checkout session mutation
  const createCheckout = trpc.credits.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
      setIsLoading(false);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Failed to create checkout session");
      setIsLoading(false);
    },
  });

  // Verify checkout session mutation
  const verifyCheckout = trpc.credits.verifyCheckoutSession.useMutation({
    onSuccess: (data) => {
      setSuccessMessage(`Successfully added ${data.creditsAdded} credits!`);
      refetchBalance();
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Failed to verify payment");
    },
  });

  // Check for successful payment on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const success = params.get("success");

    if (sessionId && success === "true") {
      verifyCheckout.mutate({ sessionId });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePurchase = async (packageId: number) => {
    setIsLoading(true);
    setErrorMessage("");
    createCheckout.mutate({ packageId });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="border-slate-700 bg-slate-800/50 p-8 text-center">
          <p className="text-slate-300 mb-4">Please log in to manage your credits</p>
          <Button onClick={() => navigate("/login")} className="bg-gradient-to-r from-blue-500 to-purple-500">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Credits</h1>
              <p className="text-slate-400">Manage your content generation credits</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Current Balance Card */}
        <Card className="border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Current Balance */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Current Balance</p>
              {balanceLoading ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
              ) : (
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {balance?.balance || 0}
                </p>
              )}
              <p className="text-slate-500 text-xs mt-2">Credits available</p>
            </div>

            {/* Total Purchased */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Total Purchased</p>
              {balanceLoading ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
              ) : (
                <p className="text-5xl font-bold text-blue-400">{balance?.totalPurchased || 0}</p>
              )}
              <p className="text-slate-500 text-xs mt-2">All time</p>
            </div>

            {/* Total Used */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Total Used</p>
              {balanceLoading ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
              ) : (
                <p className="text-5xl font-bold text-pink-400">{balance?.totalUsed || 0}</p>
              )}
              <p className="text-slate-500 text-xs mt-2">All time</p>
            </div>
          </div>
        </Card>

        {/* Credit Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-purple-400" />
            Buy Credits
          </h2>

          {packagesLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages?.map((pkg) => (
                <Card key={pkg.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6 hover:border-purple-500 transition-colors">
                  <div className="mb-6">
                    <p className="text-slate-400 text-sm mb-2">Package</p>
                    <p className="text-3xl font-bold text-white">{pkg.credits}</p>
                    <p className="text-slate-500 text-xs">Credits</p>
                  </div>

                  <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Price</p>
                    <p className="text-2xl font-bold text-white">
                      ${(pkg.priceInCents / 100).toFixed(2)}
                    </p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Transaction History
          </h2>

          {transactionsLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Card key={tx.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "purchase" ? "bg-green-500/20" : "bg-red-500/20"
                      }`}>
                        {tx.type === "purchase" ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <Coins className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{tx.type}</p>
                        <p className="text-slate-400 text-sm">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.type === "purchase" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "purchase" || tx.type === "refund" ? "+" : "-"}{tx.amount}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-700 bg-slate-800/50 p-8 text-center">
              <p className="text-slate-400">No transactions yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
