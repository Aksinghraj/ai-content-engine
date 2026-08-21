import { toast } from "sonner";

let lastRateLimitNoticeAt = 0;

function retryMessage(headers?: Headers) {
  const retryAfter = headers?.get("retry-after") ?? headers?.get("ratelimit-reset");
  const seconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : null;
  if (!seconds) return "Please wait a moment, then try again.";
  if (seconds < 60) return `Please try again in about ${seconds} seconds.`;
  return `Please try again in about ${Math.ceil(seconds / 60)} minutes.`;
}

export function notifyRateLimited(headers?: Headers) {
  const now = Date.now();
  if (now - lastRateLimitNoticeAt < 5_000) return;
  lastRateLimitNoticeAt = now;
  toast("We’re pacing requests to keep Lumae reliable", {
    description: retryMessage(headers),
    duration: 6_000,
  });
}
