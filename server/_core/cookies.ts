import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const isLocal =
    !hostname ||
    LOCAL_HOSTS.has(hostname) ||
    isIpAddress(hostname);

  // For production domains, set domain to allow cookie to work across
  // subdomains (e.g. lumae.co.in and www.lumae.co.in)
  let domain: string | undefined = undefined;
  if (!isLocal) {
    // Strip leading www. to get base domain, then prefix with dot
    const baseDomain = hostname.replace(/^www\./, "");
    domain = `.${baseDomain}`;
  }

  const secure = isSecureRequest(req);

  return {
    httpOnly: true,
    path: "/",
    // Use "none" for HTTPS (required for cross-origin) or "lax" for HTTP
    sameSite: secure ? "none" : "lax",
    secure,
    ...(domain ? { domain } : {}),
  };
}
