import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getUserCredits, initializeUserCredits, addCredits, getCreditTransactions, getCreditPackages } from "../db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-04-22.dahlia" });

export const creditsRouter = router({
  /**
   * Get current user's credit balance
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.user.id);
    
    if (!credits) {
      // Initialize credits if not exists
      await initializeUserCredits(ctx.user.id);
      return { balance: 0, totalPurchased: 0, totalUsed: 0 };
    }
    
    return {
      balance: credits.balance,
      totalPurchased: credits.totalPurchased,
      totalUsed: credits.totalUsed,
    };
  }),

  /**
   * Get credit transaction history
   */
  getTransactionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const transactions = await getCreditTransactions(ctx.user.id, input.limit);
      return transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt,
      }));
    }),

  /**
   * Get available credit packages
   */
  getPackages: publicProcedure.query(async () => {
    const packages = await getCreditPackages();
    return packages.map(p => ({
      id: p.id,
      name: p.name,
      credits: p.credits,
      priceInCents: p.priceInCents,
      stripePriceId: p.stripePriceId,
    }));
  }),

  /**
   * Create Stripe checkout session for credit purchase
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({ packageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const packages = await getCreditPackages();
        const selectedPackage = packages.find(p => p.id === input.packageId);
        
        if (!selectedPackage) {
          throw new Error("Package not found");
        }

        // Ensure user has credits initialized
        const credits = await getUserCredits(ctx.user.id);
        if (!credits) {
          await initializeUserCredits(ctx.user.id);
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: selectedPackage.stripePriceId,
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${ctx.req.headers.origin}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${ctx.req.headers.origin}/credits?canceled=true`,
          customer_email: ctx.user.email || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
            packageId: input.packageId.toString(),
            credits: selectedPackage.credits.toString(),
          },
          allow_promotion_codes: true,
        });

        return { sessionId: session.id, url: session.url };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  /**
   * Verify checkout session and add credits
   */
  verifyCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        
        if (!session || session.payment_status !== "paid") {
          throw new Error("Payment not completed");
        }

        // Extract metadata safely
        const metadata = session.metadata || {};
        const packageId = parseInt(metadata.packageId || "0");
        const creditsAmount = parseInt(metadata.credits || "0");

        if (!packageId || !creditsAmount) {
          throw new Error("Invalid session metadata");
        }

        // Get payment intent ID safely
        const paymentIntentId = typeof session.payment_intent === "string" 
          ? session.payment_intent 
          : (session.payment_intent?.id || undefined);

        // Add credits to user account
        await addCredits(
          ctx.user.id,
          creditsAmount,
          `Credit purchase: ${creditsAmount} credits`,
          paymentIntentId
        );

        return { success: true, creditsAdded: creditsAmount };
      } catch (error) {
        console.error("Error verifying checkout session:", error);
        throw new Error("Failed to verify payment");
      }
    }),

  /**
   * Admin: Initialize credit packages (one-time setup)
   */
  initializePackages: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // This would normally insert default packages into the database
    // For now, return a message
    return { message: "Packages initialized" };
  }),
});
