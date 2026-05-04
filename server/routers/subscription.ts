import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { updateUserSubscription, updateUserTheme, getTodayTokenUsage, updateUserTokenBalance } from "../db";
import crypto from "crypto";

// Razorpay will be initialized when credentials are added
let razorpay: any = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const RazorpayClass = require('razorpay');
    razorpay = new RazorpayClass({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.warn('[Razorpay] Not initialized - credentials not set yet');
}

// Subscription tier limits
const TIER_LIMITS = {
  free: {
    generationsPerDay: 5,
    maxHistoryItems: 10,
    features: ["basic_generation", "history"],
  },
  pro: {
    generationsPerDay: -1, // unlimited
    maxHistoryItems: -1, // unlimited
    features: ["basic_generation", "history", "automation", "advanced_analytics", "batch_generation", "priority_support"],
  },
};

// Razorpay plan IDs
const RAZORPAY_PLANS = {
  pro_monthly: process.env.RAZORPAY_PLAN_ID_MONTHLY || "plan_pro_monthly",
};

export const subscriptionRouter = router({
  // Get current user's subscription and usage info
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const todayUsage = await getTodayTokenUsage(user.id);
    const dailyLimit = TIER_LIMITS[user.subscriptionTier as keyof typeof TIER_LIMITS].generationsPerDay;
    
    return {
      tier: user.subscriptionTier,
      tokenBalance: user.tokenBalance,
      todayUsage,
      dailyLimit,
      theme: user.theme,
      features: TIER_LIMITS[user.subscriptionTier as keyof typeof TIER_LIMITS].features,
      isUnlimited: dailyLimit === -1,
    };
  }),

  // Update user theme
  setTheme: protectedProcedure
    .input(z.object({ theme: z.enum(["light", "dark", "auto"]) }))
    .mutation(async ({ ctx, input }) => {
      await updateUserTheme(ctx.user.id, input.theme);
      return { success: true, theme: input.theme };
    }),

  // Check if user can generate content
  canGenerate: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const todayUsage = await getTodayTokenUsage(user.id);
    const dailyLimit = TIER_LIMITS[user.subscriptionTier as keyof typeof TIER_LIMITS].generationsPerDay;
    
    if (user.subscriptionTier === "pro") {
      return { canGenerate: true, reason: "Pro user - unlimited" };
    }
    
    if (todayUsage >= dailyLimit) {
      return { canGenerate: false, reason: `Daily limit of ${dailyLimit} reached` };
    }
    
    return { canGenerate: true, reason: "Within daily limit" };
  }),

  // Consume tokens for generation
  consumeToken: protectedProcedure
    .input(z.object({ tokensToConsume: z.number().default(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      
      // Pro users have unlimited tokens
      if (user.subscriptionTier === "pro") {
        return { success: true, remaining: -1, unlimited: true };
      }
      
      // Free users consume from balance
      const newBalance = Math.max(0, user.tokenBalance - input.tokensToConsume);
      await updateUserTokenBalance(user.id, newBalance);
      
      return { success: true, remaining: newBalance, unlimited: false };
    }),

  // Create Razorpay order for Pro subscription
  createCheckoutSession: protectedProcedure
    .input(z.object({ priceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      
      try {
        // Create Razorpay order
        const order = await razorpay.orders.create({
          amount: 99900, // ₹999 in paise (monthly Pro subscription)
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
      } catch (error) {
        console.error("Razorpay order creation error:", error);
        throw new Error("Failed to create payment order");
      }
    }),

  // Verify Razorpay payment
  verifyPayment: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      paymentId: z.string(),
      signature: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      
      try {
        // Verify signature
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
        shasum.update(`${input.orderId}|${input.paymentId}`);
        const digest = shasum.digest("hex");
        
        if (digest !== input.signature) {
          throw new Error("Invalid payment signature");
        }
        
        // Fetch payment details to verify
        const payment = await razorpay.payments.fetch(input.paymentId);
        
        if (payment.status !== "captured") {
          throw new Error("Payment not captured");
        }
        
        // Update user subscription to Pro
        await updateUserSubscription(user.id, "pro", input.paymentId);
        
        return {
          success: true,
          message: "Payment verified and subscription upgraded to Pro",
          tier: "pro",
        };
      } catch (error) {
        console.error("Payment verification error:", error);
        throw new Error("Failed to verify payment");
      }
    }),

  // Get subscription details
  getSubscriptionDetails: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    
    if (user.subscriptionTier !== "pro") {
      return null;
    }
    
    return {
      tier: "pro",
      status: "active",
      features: TIER_LIMITS.pro.features,
      generationsPerDay: "Unlimited",
      supportLevel: "Priority",
    };
  }),

  // Downgrade to Free
  downgradeToFree: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    
    if (user.subscriptionTier === "free") {
      throw new Error("Already on Free tier");
    }
    
    try {
      await updateUserSubscription(user.id, "free", undefined);
      return { success: true, message: "Downgraded to Free tier", tier: "free" };
    } catch (error) {
      console.error("Downgrade error:", error);
      throw new Error("Failed to downgrade subscription");
    }
  }),
});
