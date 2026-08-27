import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getUserCredits, initializeUserCredits, addCredits, getCreditTransactions, getCreditPackages, getUserGenerationStats, createRazorpayCreditOrder, getRazorpayCreditOrderForUser, creditRazorpayOrder } from "../db";
import Stripe from "stripe";
import crypto from "crypto";
import { sendPaymentReceiptEmail } from "../_core/emailService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-04-22.dahlia" });

// ─── Razorpay HTTP helper ────────────────────────────────────────────────────
function razorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  
  if (!keyId || !keySecret) {
    console.error("[Razorpay] Missing credentials for auth header", {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
    });
  }
  
  const auth = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
  return auth;
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
    console.error(`[Razorpay] API error (${res.status}): [details redacted from logs]`);
    // Don't expose internal API error details to clients
    throw new Error(`Payment service error. Please try again or contact support.`);
  }
  return res.json();
}

// ─── Credit packages with INR pricing ────────────────────────────────────────
const CREDIT_PACKAGES_INR = [
  { id: "starter", name: "Starter Pack", credits: 100, priceINR: 499, amountPaise: 49900 },
  { id: "pro", name: "Pro Pack", credits: 500, priceINR: 1999, amountPaise: 199900 },
  { id: "enterprise", name: "Enterprise Pack", credits: 2000, priceINR: 5999, amountPaise: 599900 },
] as const;

export const creditsRouter = router({
  /**
   * Get current user's credit balance
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.user.id);

    if (!credits) {
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
   * Get user's generation stats (free AI uses + image/video credits)
   */
  getGenerationStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getUserGenerationStats(ctx.user.id);
    return {
      freeAiGenerationsUsed: stats?.freeAiGenerationsUsed ?? 0,
      freeAiGenerationsLimit: 3,
      imageVideoCredits: stats?.imageVideoCredits ?? 0,
      subscriptionTier: stats?.subscriptionTier ?? "free",
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
   * Get available credit packages (Stripe)
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
   * Get Razorpay credit packages (INR pricing)
   */
  getRazorpayPackages: publicProcedure.query(() => {
    return CREDIT_PACKAGES_INR.map(p => ({
      id: p.id,
      name: p.name,
      credits: p.credits,
      priceINR: p.priceINR,
      popular: p.id === "pro",
    }));
  }),

  /**
   * Create Razorpay order for credit purchase (India payments)
   */
  createRazorpayOrder: protectedProcedure
    .input(z.object({
      packageId: z.enum(["starter", "pro", "enterprise"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Payment service not configured. Please contact support.");
      }

      const pkg = CREDIT_PACKAGES_INR.find(p => p.id === input.packageId);
      if (!pkg) throw new Error("Package not found");

      // Ensure user credits are initialized
      const credits = await getUserCredits(ctx.user.id);
      if (!credits) await initializeUserCredits(ctx.user.id);

      const receiptId = `credits_${ctx.user.id}_${crypto.randomUUID()}`;
      const order = await razorpayRequest("/orders", "POST", {
        amount: pkg.amountPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          purchaseType: "lumae_credits",
        },
      });

      await createRazorpayCreditOrder({
        userId: ctx.user.id,
        razorpayOrderId: order.id,
        receiptId,
        packageId: pkg.id,
        credits: pkg.credits,
        amountPaise: pkg.amountPaise,
        currency: "INR",
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        packageName: pkg.name,
        credits: pkg.credits,
        priceINR: pkg.priceINR,
      };
    }),

  /**
   * Verify Razorpay payment signature and add credits
   */
  verifyRazorpayPayment: protectedProcedure
    .input(z.object({
      orderId: z.string().regex(/^order_[A-Za-z0-9]+$/),
      paymentId: z.string().regex(/^pay_[A-Za-z0-9]+$/),
      signature: z.string().regex(/^[a-f0-9]{64}$/i),
      // Retained for backwards-compatible clients, but never trusted.
      packageId: z.enum(["starter", "pro", "enterprise"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Payment service not configured.");
      }

      const order = await getRazorpayCreditOrderForUser(ctx.user.id, input.orderId);
      if (!order || order.status === "credited" || order.status === "failed" || order.status === "cancelled") {
        throw new Error("Payment could not be verified. Please contact support if you were charged.");
      }

      // HMAC-SHA256 signature verification
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${input.orderId}|${input.paymentId}`)
        .digest("hex");

      const providedSignature = Buffer.from(input.signature, "hex");
      const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
      const isValid = providedSignature.length === expectedSignatureBuffer.length && crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer);

      if (!isValid) {
        throw new Error("Payment could not be verified. Please contact support if you were charged.");
      }

      // Fetch provider data and compare it to the server-owned order, never the browser input.
      const payment = await razorpayRequest(`/payments/${input.paymentId}`);
      if (
        payment.status !== "captured" ||
        payment.order_id !== order.razorpayOrderId ||
        Number(payment.amount) !== order.amountPaise ||
        payment.currency !== order.currency
      ) {
        throw new Error("Payment could not be verified. Please contact support if you were charged.");
      }

      const result = await creditRazorpayOrder(ctx.user.id, order.razorpayOrderId, input.paymentId);

      // Do not repeat a receipt for idempotent verification retries.
      const emailSent = !result.alreadyCredited && ctx.user.email ? await sendPaymentReceiptEmail(
        ctx.user.email,
        ctx.user.name || "User",
        {
          orderId: input.orderId,
          amount: order.amountPaise,
          currency: order.currency,
          creditsAdded: result.creditsAdded,
          paymentMethod: payment.method || "Unknown",
          transactionDate: new Date(payment.created_at * 1000).toISOString(),
        }
      ) : false;

      return {
        success: true,
        message: result.alreadyCredited ? "This payment was already applied to your account." : `Payment verified. ${result.creditsAdded} credits were added to your account.`,
        creditsAdded: result.creditsAdded,
        emailSent,
      };
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

        const credits = await getUserCredits(ctx.user.id);
        if (!credits) {
          await initializeUserCredits(ctx.user.id);
        }

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
          client_reference_id: ctx.user.id.toString(),
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

        const metadata = session.metadata || {};
        if (metadata.userId !== ctx.user.id.toString() || session.client_reference_id !== ctx.user.id.toString()) {
          throw new Error("Payment session does not belong to this account");
        }
        const packageId = parseInt(metadata.packageId || "0");
        if (!packageId) {
          throw new Error("Invalid session metadata");
        }
        const packages = await getCreditPackages();
        const selectedPackage = packages.find((item) => item.id === packageId);
        if (!selectedPackage || session.amount_total !== selectedPackage.priceInCents) {
          throw new Error("Payment session verification failed");
        }

        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id || undefined);

        await addCredits(
          ctx.user.id,
          selectedPackage.credits,
          `Credit purchase: ${selectedPackage.credits} credits`,
          paymentIntentId
        );

        return { success: true, creditsAdded: selectedPackage.credits };
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
    return { message: "Packages initialized" };
  }),
});
