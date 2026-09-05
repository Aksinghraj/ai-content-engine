import { describe, expect, it } from "vitest";
import { handleMetaWebhookVerification } from "./routes/metaWebhook";

describe("Meta webhook verification secret", () => {
  it("accepts Meta's verification challenge only when the configured private token matches", () => {
    const token = process.env.META_WEBHOOK_VERIFY_TOKEN;
    expect(token).toBeDefined();
    expect(token?.length).toBeGreaterThanOrEqual(32);

    const sent: { status?: number; body?: string } = {};
    const response = {
      status(code: number) { sent.status = code; return this; },
      send(body: string) { sent.body = body; return this; },
    };
    handleMetaWebhookVerification({
      query: { "hub.mode": "subscribe", "hub.verify_token": token, "hub.challenge": "challenge-accepted" },
    } as any, response as any);

    expect(sent).toEqual({ status: 200, body: "challenge-accepted" });
  });

  it("rejects an incorrect verification token", () => {
    const sent: { status?: number; body?: string } = {};
    const response = {
      status(code: number) { sent.status = code; return this; },
      send(body: string) { sent.body = body; return this; },
    };
    handleMetaWebhookVerification({
      query: { "hub.mode": "subscribe", "hub.verify_token": "incorrect-token", "hub.challenge": "challenge" },
    } as any, response as any);

    expect(sent.status).toBe(403);
  });
});
