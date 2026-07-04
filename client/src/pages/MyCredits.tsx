import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ShoppingCart,
  Zap,
  Star,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const TYPE_CONFIG = {
  purchase: {
    label: "Purchase",
    icon: ArrowUpRight,
    color: "text-green-500",
    badgeVariant: "default" as const,
    bgColor: "bg-green-500/10",
  },
  usage: {
    label: "Used",
    icon: ArrowDownRight,
    color: "text-red-400",
    badgeVariant: "destructive" as const,
    bgColor: "bg-red-500/10",
  },
  refund: {
    label: "Refund",
    icon: RefreshCw,
    color: "text-blue-400",
    badgeVariant: "secondary" as const,
    bgColor: "bg-blue-500/10",
  },
};

export default function MyCredits() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const { data: balance, isLoading: balanceLoading } = trpc.credits.getBalance.useQuery();
  const { data: transactions, isLoading: txLoading } = trpc.credits.getTransactionHistory.useQuery(
    { limit: 200 },
    { staleTime: 30_000 }
  );

  const pagedTx = transactions?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];
  const totalPages = Math.ceil((transactions?.length ?? 0) / PAGE_SIZE);

  const purchaseTotal = transactions
    ?.filter((t) => t.type === "purchase")
    .reduce((s, t) => s + t.amount, 0) ?? 0;
  const usageTotal = transactions
    ?.filter((t) => t.type === "usage")
    .reduce((s, t) => s + Math.abs(t.amount), 0) ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Credits</h1>
            <p className="text-muted-foreground mt-1">
              Track your credit balance and transaction history
            </p>
          </div>
          <Button
            onClick={() => setLocation("/razorpay-payments")}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy More Credits
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Current Balance */}
          <Card className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/10 border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Current Balance</span>
            </div>
            {balanceLoading ? (
              <div className="h-10 bg-muted rounded animate-pulse w-24" />
            ) : (
              <p className="text-4xl font-bold text-purple-400">
                {(balance?.balance ?? 0).toLocaleString()}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">credits available</p>
          </Card>

          {/* Total Purchased */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Total Purchased</span>
            </div>
            {balanceLoading ? (
              <div className="h-10 bg-muted rounded animate-pulse w-24" />
            ) : (
              <p className="text-4xl font-bold text-green-500">
                {purchaseTotal.toLocaleString()}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">credits bought</p>
          </Card>

          {/* Total Used */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Total Used</span>
            </div>
            {balanceLoading ? (
              <div className="h-10 bg-muted rounded animate-pulse w-24" />
            ) : (
              <p className="text-4xl font-bold text-red-400">
                {usageTotal.toLocaleString()}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">credits consumed</p>
          </Card>
        </div>

        {/* Quick Buy Packages */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Buy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "starter", label: "Starter", credits: 100, price: "₹499", icon: Zap, color: "text-blue-400" },
              { id: "pro", label: "Pro", credits: 500, price: "₹1,999", icon: Star, color: "text-purple-400", popular: true },
              { id: "enterprise", label: "Enterprise", credits: 2000, price: "₹5,999", icon: Crown, color: "text-yellow-400" },
            ].map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-4 cursor-pointer hover:border-purple-500/50 transition-colors ${
                  pkg.popular ? "border-purple-500/50 bg-purple-500/5" : ""
                }`}
                onClick={() => setLocation("/razorpay-payments")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <pkg.icon className={`w-4 h-4 ${pkg.color}`} />
                  <span className="font-semibold text-sm">{pkg.label}</span>
                  {pkg.popular && (
                    <Badge className="text-xs bg-purple-600 ml-auto">Popular</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold">{pkg.credits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">credits · {pkg.price}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            {transactions && transactions.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <Card className="overflow-hidden">
            {txLoading ? (
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                ))}
              </div>
            ) : pagedTx.length === 0 ? (
              <div className="p-12 text-center">
                <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Buy credits to get started with AI content generation
                </p>
                <Button
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setLocation("/razorpay-payments")}
                >
                  Buy Credits
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pagedTx.map((tx) => {
                  const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.usage;
                  const Icon = cfg.icon;
                  const isPositive = tx.amount > 0;
                  return (
                    <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className={`w-9 h-9 rounded-lg ${cfg.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {tx.description || cfg.label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleString()}
                          </span>
                          <Badge variant={cfg.badgeVariant} className="text-xs py-0">
                            {cfg.label}
                          </Badge>
                        </div>
                      </div>
                      <span className={`font-bold text-base tabular-nums ${isPositive ? "text-green-500" : "text-red-400"}`}>
                        {isPositive ? "+" : ""}{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
