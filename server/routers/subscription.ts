import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { updateUserSubscription, updateUserTheme, getTodayTokenUsage, updateUserTokenBalance } from "../db";
import crypto from "crypto";

// ─── Razorpay HTTP helper ───────────────────────────────────────────────────
function razorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest(path: string, method = "GET", body?: object) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: razorpayAuth(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay API error (${res.status}): ${err}`);
  }
  return res.json();
}

// ─── Plan definitions ────────────────────────────────────────────────────────
export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "INR",
    features: [
      "5 AI content generations/day",
      "Basic analytics",
      "10 saved history items",
      "Community support",
    ],
    limits: { generationsPerDay: 5, historyItems: 10 },
    badge: null,
  },
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro Monthly",
    monthlyPrice: 999,
    yearlyPrice: 999,
    currency: "INR",
    amountPaise: 99900,
    features: [
      "Unlimited AI content generations",
      "Advanced analytics & ROI dashboard",
      "Unlimited history",
      "Auto-reply AI system",
      "Multi-platform scheduling",
      "Priority support",
      "Custom templates",
    ],
    limits: { generationsPerDay: -1, historyItems: -1 },
    badge: "Most Popular",
  },
  pro_yearly: {
    id: "pro_yearly",
    name: "Pro Yearly",
    monthlyPrice: 699,
    yearlyPrice: 8388,
    currency: "INR",
    amountPaise: 838800, // ₹8,388 per year (₹699/month × 12)
    features: [
      "Everything in Pro Monthly",
      "Save 30% vs monthly",
      "Early access to new features",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    limits: { generationsPerDay: -1, historyItems: -1 },
    badge: "Best Value",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "INR",
    features: [
      "Everything in Pro Yearly",
      "Custom AI model fine-tuning",
      "White-label solution",
      "API access",
      "Team collaboration",
      "Custom contracts & invoicing",
      "24/7 dedicated support",
    ],
    limits: { generationsPerDay: -1, historyItems: -1 },
    badge: "Contact Us",
  },
};

// ─── Tier limits ─────────────────────────────────────────────────────────────
const TIER_LIMITS = {
  free: SUBSCRIPTION_PLANS.free.limits,
  pro: SUBSCRIPTION_PLANS.pro_monthly.limits,
};

export const subscriptionRouter = router({
  // ── Get all available plans ────────────────────────────────────────────────
  getPlans: publicProcedure.query(() => {
    return Object.values(SUBSCRIPTION_PLANS);
  }),

  // ── Get current user subscription status ──────────────────────────────────
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const todayUsage = await getTodayTokenUsage(user.id);
    const tierKey = user.subscriptionTier === "pro" ? "pro" : "free";
    const dailyLimit = TIER_LIMITS[tierKey].generationsPerDay;

    return {
      tier: user.subscriptionTier,
      tokenBalance: user.tokenBalance,
      todayUsage,
      dailyLimit,
      theme: user.theme,
      features: user.subscriptionTier === "pro"
        ? SUBSCRIPTION_PLANS.pro_monthly.features
        : SUBSCRIPTION_PLANS.free.features,
      isUnlimited: dailyLimit === -1,
    };
  }),

  // ── Update user theme ──────────────────────────────────────────────────────
  setTheme: protectedProcedure
    .input(z.object({ theme: z.enum(["light", "dark", "auto"]) }))
    .mutation(async ({ ctx, input }) => {
      await updateUserTheme(ctx.user.id, input.theme);
      return { success: true, theme: input.theme };
    }),

  // ── Check if user can generate content ────────────────────────────────────
  canGenerate: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.subscriptionTier === "pro") {
      return { canGenerate: true, reason: "Pro user - unlimited" };
    }
    const todayUsage = await getTodayTokenUsage(user.id);
    const dailyLimit = TIER_LIMITS.free.generationsPerDay;
    if (todayUsage >= dailyLimit) {
      return { canGenerate: false, reason: `Daily limit of ${dailyLimit} reached` };
    }
    return { canGenerate: true, reason: "Within daily limit" };
  }),

  // ── Consume tokens ─────────────────────────────────────────────────────────
  consumeToken: protectedProcedure
    .input(z.object({ tokensToConsume: z.number().default(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (user.subscriptionTier === "pro") {
        return { success: true, remaining: -1, unlimited: true };
      }
      const newBalance = Math.max(0, user.tokenBalance - input.tokensToConsume);
      await updateUserTokenBalance(user.id, newBalance);
      return { success: true, remaining: newBalance, unlimited: false };
    }),

  // ── Create Razorpay order ──────────────────────────────────────────────────
  createOrder: protectedProcedure
    .input(z.object({
      planId: z.enum(["pro_monthly", "pro_yearly"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      const plan = SUBSCRIPTION_PLANS[input.planId];

      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Payment service not configured. Please contact support.");
      }

      const receiptId = `sub_${user.id}_${input.planId}_${Date.now()}`;

      const order = await razorpayRequest("/orders", "POST", {
        amount: plan.amountPaise,
        currency: plan.currency,
        receipt: receiptId,
        notes: {
          userId: user.id.toString(),
          userEmail: user.email || "",
          userName: user.name || "",
          planId: input.planId,
          planName: plan.name,
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planName: plan.name,
        planId: input.planId,
      };
    }),

  // ── Legacy alias for createOrder ──────────────────────────────────────────
  createCheckoutSession: protectedProcedure
    .input(z.object({ priceId: z.string().optional() }))
    .mutation(async ({ ctx }) => {
      const user = ctx.user;
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Payment service not configured.");
      }
      const order = await razorpayRequest("/orders", "POST", {
        amount: SUBSCRIPTION_PLANS.pro_monthly.amountPaise,
        currency: "INR",
        receipt: `order_${user.id}_${Date.now()}`,
        notes: {
          userId: user.id.toString(),
          userEmail: user.email || "",
          userName: user.name || "",
          plan: "pro_monthly",
        },
      });
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    }),

  // ── Verify Razorpay payment signature ─────────────────────────────────────
  verifyPayment: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      paymentId: z.string(),
      signature: z.string(),
      planId: z.enum(["pro_monthly", "pro_yearly"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;

      // HMAC-SHA256 signature verification
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(`${input.orderId}|${input.paymentId}`)
        .digest("hex");

      const isValid = crypto.timingSafeEqual(
        Buffer.from(input.signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        throw new Error("Invalid payment signature — possible tampering detected");
      }

      // Fetch payment from Razorpay to confirm captured status
      const payment = await razorpayRequest(`/payments/${input.paymentId}`);

      if (payment.status !== "captured") {
        throw new Error(`Payment not captured. Status: ${payment.status}`);
      }

      // Upgrade user to Pro
      await updateUserSubscription(user.id, "pro", input.paymentId);

      return {
        success: true,
        message: "Payment verified. Your subscription has been upgraded to Pro!",
        tier: "pro",
        planId: input.planId || "pro_monthly",
        paymentId: input.paymentId,
      };
    }),

  // ── Get subscription details ───────────────────────────────────────────────
  getSubscriptionDetails: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.subscriptionTier !== "pro") {
      return null;
    }
    return {
      tier: "pro",
      status: "active",
      features: SUBSCRIPTION_PLANS.pro_monthly.features,
      generationsPerDay: "Unlimited",
      supportLevel: "Priority",
    };
  }),

  // ── Downgrade to Free ──────────────────────────────────────────────────────
  downgradeToFree: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    if (user.subscriptionTier === "free") {
      throw new Error("Already on Free tier");
    }
    await updateUserSubscription(user.id, "free", undefined);
    return { success: true, message: "Downgraded to Free tier", tier: "free" };
  }),
});
