import { Request, Response } from "express";
import RazorpayPaymentService from "./razorpayService";
import { getUserByEmail, addCredits, updateUserSubscription } from "../db";

/**
 * Secure Razorpay Webhook Handler
 * Endpoint: POST /api/webhooks/razorpay
 */

let razorpayService: RazorpayPaymentService | null = null;

export function initializeRazorpayService(config: {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}): void {
  razorpayService = new RazorpayPaymentService(config);
  console.log("[Razorpay] Service initialized");
}

export async function handleRazorpayWebhook(req: Request, res: Response): Promise<void> {
  try {
    if (!razorpayService) {
      console.error("[Razorpay Webhook] Service not initialized");
      res.status(503).json({ error: "Service unavailable" });
      return;
    }

    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      console.warn("[Razorpay Webhook] Missing X-Razorpay-Signature header");
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    const rawBody = JSON.stringify(req.body);
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("[Razorpay Webhook] Invalid signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    console.log(`[Razorpay Webhook] Valid signature - Event: ${req.body.event}`);

    switch (req.body.event) {
      case "payment.captured":
        await handlePaymentCaptured(req.body);
        break;

      case "payment.failed":
        await handlePaymentFailed(req.body);
        break;

      case "order.paid":
        await handleOrderPaid(req.body);
        break;

      case "refund.processed":
        await handleRefundProcessed(req.body);
        break;

      default:
        console.log(`[Razorpay Webhook] Unhandled event: ${req.body.event}`);
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("[Razorpay Webhook] Error:", error);
    res.status(200).json({ error: "Processing error", status: "received" });
  }
}

async function handlePaymentCaptured(payload: any): Promise<void> {
  try {
    const entity = payload.payload?.payment?.entity || payload.entity || {};
    const paymentId = entity.id;
    const amount = entity.amount / 100; // paise to rupees
    const notes = entity.notes || {};

    const userEmail = notes.userEmail;
    const userId = notes.userId ? parseInt(notes.userId) : null;
    const credits = notes.credits ? parseInt(notes.credits) : null;
    const planId = notes.planId || null;

    console.log(`[Razorpay Webhook] payment.captured: ${paymentId}`, {
      amount,
      userId,
      userEmail,
      credits,
      planId,
    });

    // Resolve user by ID or email
    let resolvedUserId: number | null = userId;
    if (!resolvedUserId && userEmail) {
      const user = await getUserByEmail(userEmail);
      resolvedUserId = user?.id ?? null;
    }

    if (!resolvedUserId) {
      console.error("[Razorpay Webhook] Cannot resolve user for payment", {
        paymentId,
        userEmail,
        userId,
      });
      return;
    }

    // Subscription upgrade (pro_monthly or pro_yearly)
    if (planId && (planId === "pro_monthly" || planId === "pro_yearly")) {
      await updateUserSubscription(resolvedUserId, "pro", paymentId);
      console.log(
        `[Razorpay Webhook] Upgraded user ${resolvedUserId} to Pro (plan: ${planId})`
      );
    }

    // Credit purchase — add credits to account
    if (credits && credits > 0) {
      await addCredits(
        resolvedUserId,
        credits,
        `Razorpay webhook: ${credits} credits purchased (payment: ${paymentId})`,
        paymentId
      );
      console.log(
        `[Razorpay Webhook] Added ${credits} credits to user ${resolvedUserId}`
      );
    }

    razorpayService?.logAuditEvent("payment_captured", {
      paymentId,
      userId: resolvedUserId,
      amount,
      credits,
      planId,
    });
  } catch (error) {
    console.error("[Razorpay Webhook] Error processing payment.captured:", error);
  }
}

async function handlePaymentFailed(payload: any): Promise<void> {
  try {
    const entity = payload.payload?.payment?.entity || payload.entity || {};
    const paymentId = entity.id;
    const userEmail = entity.notes?.userEmail;
    const errorCode = entity.error_code;
    const errorDescription = entity.error_description;

    console.error(`[Razorpay Webhook] Payment failed: ${paymentId}`, {
      userEmail,
      errorCode,
      errorDescription,
    });

    razorpayService?.logAuditEvent("payment_failed", {
      paymentId,
      userEmail,
      errorCode,
      errorDescription,
    });
  } catch (error) {
    console.error("[Razorpay Webhook] Error processing payment.failed:", error);
  }
}

async function handleOrderPaid(payload: any): Promise<void> {
  try {
    const entity = payload.payload?.order?.entity || payload.entity || {};
    const orderId = entity.id;
    console.log(`[Razorpay Webhook] Order paid: ${orderId}`);

    razorpayService?.logAuditEvent("order_paid", {
      orderId,
      amount: entity.amount,
      currency: entity.currency,
    });
  } catch (error) {
    console.error("[Razorpay Webhook] Error processing order.paid:", error);
  }
}

async function handleRefundProcessed(payload: any): Promise<void> {
  try {
    const entity = payload.payload?.refund?.entity || payload.entity || {};
    const refundId = entity.id;
    console.log(`[Razorpay Webhook] Refund processed: ${refundId}`);

    razorpayService?.logAuditEvent("refund_processed", {
      refundId,
      amount: entity.amount,
      status: entity.status,
    });
  } catch (error) {
    console.error("[Razorpay Webhook] Error processing refund.processed:", error);
  }
}

export { RazorpayPaymentService };
