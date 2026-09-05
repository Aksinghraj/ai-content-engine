import crypto from "node:crypto";
import { Router, type Request, type Response } from "express";

const VERIFY_TOKEN_MIN_LENGTH = 32;

function secureEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function handleMetaWebhookVerification(req: Pick<Request, "query">, res: Pick<Response, "status" | "send">) {
  const mode = typeof req.query["hub.mode"] === "string" ? req.query["hub.mode"] : "";
  const token = typeof req.query["hub.verify_token"] === "string" ? req.query["hub.verify_token"] : "";
  const challenge = typeof req.query["hub.challenge"] === "string" ? req.query["hub.challenge"] : "";
  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "";

  if (
    mode === "subscribe" &&
    challenge.length > 0 &&
    expectedToken.length >= VERIFY_TOKEN_MIN_LENGTH &&
    secureEqual(token, expectedToken)
  ) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Webhook verification failed");
}

export function isValidMetaWebhookSignature(rawBody: Buffer, signature: unknown): boolean {
  if (typeof signature !== "string" || !signature.startsWith("sha256=")) return false;
  const candidateSecrets = [process.env.INSTAGRAM_CLIENT_SECRET, process.env.FACEBOOK_CLIENT_SECRET]
    .filter((value): value is string => Boolean(value && value.length >= 16));
  const received = signature.slice("sha256=".length);
  return candidateSecrets.some((secret) => {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return secureEqual(received, expected);
  });
}

export const metaWebhookRouter = Router();

metaWebhookRouter.get("/", handleMetaWebhookVerification);

metaWebhookRouter.post("/", (req: Request, res: Response) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!isValidMetaWebhookSignature(rawBody, req.header("x-hub-signature-256"))) {
    return res.status(403).json({ error: "invalid-webhook-signature" });
  }

  // Acknowledge verified events promptly. Event parsing, consent checks, and any
  // provider action are intentionally performed by subsequent guarded handlers.
  return res.status(200).json({ received: true });
});
