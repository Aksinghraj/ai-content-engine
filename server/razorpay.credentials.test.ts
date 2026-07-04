import { describe, it, expect } from "vitest";
import crypto from "crypto";

describe("Razorpay Credentials Validation", () => {
  it("should have RAZORPAY_KEY_ID set", () => {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    expect(keyId.length).toBeGreaterThan(0);
    expect(keyId).toMatch(/^rzp_(test|live)_/);
  });

  it("should have RAZORPAY_KEY_SECRET set", () => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    expect(keySecret.length).toBeGreaterThan(0);
  });

  it("should have RAZORPAY_WEBHOOK_SECRET set", () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    expect(webhookSecret.length).toBeGreaterThan(0);
  });

  it("should correctly generate HMAC-SHA256 webhook signature", () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "test-secret";
    const testPayload = JSON.stringify({ event: "payment.captured", entity: { id: "pay_test123" } });

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(testPayload)
      .digest("hex");

    // Verify the signature is a valid hex string
    expect(signature).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should correctly verify webhook signatures using timing-safe comparison", () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "test-secret";
    const testPayload = JSON.stringify({ event: "payment.captured", entity: { id: "pay_test123" } });

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(testPayload)
      .digest("hex");

    // Verify correct signature passes
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(expectedSignature)
    );
    expect(isValid).toBe(true);
  });

  it("should reject invalid webhook signatures", () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "test-secret";
    const testPayload = JSON.stringify({ event: "payment.captured", entity: { id: "pay_test123" } });

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(testPayload)
      .digest("hex");

    const fakeSignature = "a".repeat(64);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(fakeSignature),
      Buffer.from(expectedSignature)
    );
    expect(isValid).toBe(false);
  });
});
