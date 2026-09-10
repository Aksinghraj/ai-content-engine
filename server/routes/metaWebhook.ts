import crypto from "node:crypto";
import { Router, type Request, type Response } from "express";
import { getSocialConnectionByPlatformUserId } from "../db/social";
import { createEngagementEvent, hasEngagementEvent } from "../db/enterprise";

const VERIFY_TOKEN_MIN_LENGTH = 32;

type MetaEvent = {
  connectionPlatformUserId: string;
  eventType: "comment" | "dm";
  externalId: string;
  authorId: string;
  authorName: string;
  content: string;
  postId?: string;
};

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

  if (mode === "subscribe" && challenge.length > 0 && expectedToken.length >= VERIFY_TOKEN_MIN_LENGTH && secureEqual(token, expectedToken)) {
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

function stringValue(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function parseMetaEvents(payload: any): MetaEvent[] {
  const events: MetaEvent[] = [];
  for (const entry of Array.isArray(payload?.entry) ? payload.entry : []) {
    const accountId = stringValue(entry?.id);
    if (!accountId) continue;

    for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
      if (change?.field !== "comments") continue;
      const value = change?.value || {};
      const externalId = stringValue(value.id);
      const content = stringValue(value.text);
      const authorId = stringValue(value.from?.id) || "unknown";
      const authorName = stringValue(value.from?.username) || stringValue(value.from?.name) || "Meta user";
      if (!externalId || !content) continue;
      events.push({
        connectionPlatformUserId: accountId,
        eventType: "comment",
        externalId,
        authorId,
        authorName,
        content,
        postId: stringValue(value.media?.id) || undefined,
      });
    }

    for (const message of Array.isArray(entry?.messaging) ? entry.messaging : []) {
      const messageId = stringValue(message?.message?.mid);
      const content = stringValue(message?.message?.text);
      const authorId = stringValue(message?.sender?.id) || "unknown";
      if (!messageId || !content) continue;
      events.push({
        connectionPlatformUserId: accountId,
        eventType: "dm",
        externalId: messageId,
        authorId,
        authorName: "Meta user",
        content,
      });
    }
  }
  return events;
}

async function persistMetaEvents(payload: unknown) {
  const parsedEvents = parseMetaEvents(payload);
  let persisted = 0;
  for (const event of parsedEvents) {
    const connection = await getSocialConnectionByPlatformUserId(event.connectionPlatformUserId);
    if (!connection || !connection.isValidated) continue;
    const postId = `meta:${event.eventType}:${event.externalId}`;
    if (await hasEngagementEvent(connection.userId, connection.id, event.eventType, postId)) continue;
    await createEngagementEvent({
      userId: connection.userId,
      socialConnectionId: connection.id,
      platform: connection.platform,
      eventType: event.eventType,
      authorName: event.authorName,
      authorId: event.authorId,
      content: event.content,
      sentiment: "neutral",
      sentimentScore: "0.50",
      intent: "other",
      postId,
      isEscalated: false,
      autoReplySent: false,
    });
    persisted += 1;
  }
  return { received: parsedEvents.length, persisted };
}

export const metaWebhookRouter = Router();
metaWebhookRouter.get("/", handleMetaWebhookVerification);
metaWebhookRouter.post("/", async (req: Request, res: Response) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!isValidMetaWebhookSignature(rawBody, req.header("x-hub-signature-256"))) {
    return res.status(403).json({ error: "invalid-webhook-signature" });
  }
  try {
    const payload = JSON.parse(rawBody.toString("utf8"));
    const result = await persistMetaEvents(payload);
    return res.status(200).json({ ok: true, ...result });
  } catch {
    return res.status(400).json({ error: "invalid-webhook-payload" });
  }
});
