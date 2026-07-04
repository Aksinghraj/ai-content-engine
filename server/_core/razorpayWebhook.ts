import { Request, Response } from "express";
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
    const paymentId = payload.entity.id;
    const amount = payload.entity.amount / 100;
    const customerId = payload.entity.notes?.customerId;

    console.log(`[Razorpay] Processing payment.captured: ${paymentId}`, {
      amount,
      customerId,
    });

    if (!customerId) {
      console.error("[Razorpay] Missing customerId in payment notes");
      return;
    }

    const creditsToAdd = Math.floor(amount * 100);

    razorpayService?.logAuditEvent("payment_captured", {
      paymentId,
      customerId,
      amount,
      creditsAdded: creditsToAdd,
    });

    console.log(`[Razorpay] Payment processed successfully`, {
      paymentId,
      customerId,
      creditsAdded: creditsToAdd,
    });
  } catch (error) {
    console.error("[Razorpay] Error processing payment.captured:", error);
  }
}

async function handlePaymentFailed(payload: any): Promise<void> {
  try {
    const paymentId = payload.entity.id;
    const customerId = payload.entity.notes?.customerId;
    const errorCode = payload.entity.error_code;
    const errorDescription = payload.entity.error_description;

    console.error(`[Razorpay] Payment failed: ${paymentId}`, {
      customerId,
      errorCode,
      errorDescription,
    });

    razorpayService?.logAuditEvent("payment_failed", {
      paymentId,
      customerId,
      errorCode,
      errorDescription,
    });
  } catch (error) {
    console.error("[Razorpay] Error processing payment.failed:", error);
  }
}

async function handleOrderPaid(payload: any): Promise<void> {
  try {
    const orderId = payload.entity.id;
    console.log(`[Razorpay] Order paid: ${orderId}`);

    razorpayService?.logAuditEvent("order_paid", {
      orderId,
      amount: payload.entity.amount,
      currency: payload.entity.currency,
    });
  } catch (error) {
    console.error("[Razorpay] Error processing order.paid:", error);
  }
}

async function handleRefundProcessed(payload: any): Promise<void> {
  try {
    const refundId = payload.entity.id;
    console.log(`[Razorpay] Refund processed: ${refundId}`);

    razorpayService?.logAuditEvent("refund_processed", {
      refundId,
      amount: payload.entity.amount,
      status: payload.entity.status,
    });
  } catch (error) {
    console.error("[Razorpay] Error processing refund.processed:", error);
  }
}

export { RazorpayPaymentService };
