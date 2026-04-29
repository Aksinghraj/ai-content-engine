import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { updateUserSubscription, updateUserTheme, getTodayTokenUsage, updateUserTokenBalance } from "../db";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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

  // Create checkout session for Pro subscription
  createCheckoutSession: protectedProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      
      try {
        // Create or get Stripe customer
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email || undefined,
            name: user.name || undefined,
            metadata: {
              userId: user.id.toString(),
            },
          });
          customerId = customer.id;
        }
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          success_url: `${ctx.req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${ctx.req.headers.origin}/pricing`,
          metadata: {
            userId: user.id.toString(),
          },
        });
        
        return { sessionId: session.id, url: session.url };
      } catch (error) {
        console.error("Stripe checkout error:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  // Get subscription details
  getSubscriptionDetails: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    
    if (!user.stripeSubscriptionId) {
      return null;
    }
    
    try {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const sub = subscription as any;
      return {
        id: sub.id,
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      };
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  }),

  // Cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    
    if (!user.stripeSubscriptionId) {
      throw new Error("No active subscription");
    }
    
    try {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      
      return { success: true, message: "Subscription will be cancelled at period end" };
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }),
});
