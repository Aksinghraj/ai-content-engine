import type { Request, Response } from "express";
import RazorpayPaymentService from "./razorpayService";

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

export async function handleRazorpayWebhook(req: Request, res: Response, rawBody: Buffer): Promise<void> {
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

    if (!Buffer.isBuffer(rawBody)) {
      res.status(400).json({ error: "Invalid webhook payload" });
      return;
    }
    const isValid = razorpayService.verifyWebhookSignature(rawBody.toString("utf8"), signature);

    if (!isValid) {
      console.error("[Razorpay Webhook] Invalid signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    console.log(`[Razorpay Webhook] Valid signature - Event: ${payload.event}`);

    switch (payload.event) {
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "order.paid":
        await handleOrderPaid(payload);
        break;

      case "refund.processed":
        await handleRefundProcessed(payload);
        break;

      default:
        console.log(`[Razorpay Webhook] Unhandled event: ${payload.event}`);
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
    // Credits are issued only after the authenticated browser verifies the
    // server-owned order, amount, package, and captured provider payment.
    console.log(`[Razorpay Webhook] Captured payment received: ${paymentId}`);
    razorpayService?.logAuditEvent("payment_captured", { paymentId });
  } catch (error) {
    console.error("[Razorpay Webhook] Error processing payment.captured:", error);
  }
}

async function handlePaymentFailed(payload: any): Promise<void> {
  try {
    const entity = payload.payload?.payment?.entity || payload.entity || {};
    const paymentId = entity.id;
    const errorCode = entity.error_code;
    console.error(`[Razorpay Webhook] Payment failed: ${paymentId}, code: ${errorCode || "unknown"}`);

    razorpayService?.logAuditEvent("payment_failed", {
      paymentId,
      errorCode,
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
