import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook, verifyStripeSignature } from "./stripeWebhook";
import { handleRazorpayWebhook, initializeRazorpayService } from "./razorpayWebhook";
import { initializeAutomationEngine } from "./automationEngine";
import { runScheduledAutomation } from "../routes/scheduledAutomation";
import { refreshScheduledTrends } from "../routes/scheduledTrendRefresh";
import { ensureTrendRefreshJob } from "./trendScheduler";
import { ensureScheduledPostDispatcher, runScheduledPosts } from "./scheduledPostScheduler";
import { storageGetSignedUrl } from "../storage";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Rate limiter for auth endpoints (login, OTP, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact requests. Please try again later." },
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment requests. Please try again later." },
});

const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many security-code attempts. Please wait before trying again." },
});

const localAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait before trying again." },
});

const allowedOrigins = [
  "https://lumae.co.in",
  "https://www.lumae.co.in",
  "https://lumae.manus.space",
  "https://aicontent-femeuybh.manus.space",
];
const isAllowedOrigin = (origin: string) => allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust the reverse proxy (Manus/Cloud Run) so req.protocol is correct
  // This is required for cookies with secure:true and sameSite:none to work
  app.set("trust proxy", 1);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        fontSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        // Razorpay opens its PCI-hosted checkout inside a nested browsing context.
        // Keep the allowlist narrow rather than relaxing default-src for all frames.
        frameSrc: ["'self'", "https://checkout.razorpay.com", "https://api.razorpay.com"],
        upgradeInsecureRequests: [],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));

  // Apply rate limiting to auth and API routes
  // CORS - restrict to production domains only
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,trpc-accept");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use("/api/oauth", authLimiter);
  app.use("/api/trpc/auth", authLimiter);
  app.use("/api/trpc/system.sendContactMessage", contactLimiter);
  app.use("/api/trpc/credits", paymentLimiter);
  app.use("/api/trpc/twoFactor", twoFactorLimiter);
  app.use("/api/trpc/localAuth", localAuthLimiter);
  app.use("/api/trpc", (req, res, next) => {
    const origin = req.headers.origin;
    const unsafeMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    if (unsafeMethod && origin && !isAllowedOrigin(origin)) {
      return res.status(403).json({ error: "untrusted-origin" });
    }
    next();
  });
  app.use("/api/trpc", apiLimiter);

  // Dev: log incoming requests for debugging
  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      console.log(`[DEV-LOG] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      next();
    });
  }
  
  // Initialize Razorpay service if credentials are available
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!razorpayKeyId) {
    console.warn("[Razorpay] Key ID not found in environment");
  }
  
  if (razorpayKeyId && razorpayKeySecret && razorpayWebhookSecret) {
    initializeRazorpayService({
      keyId: razorpayKeyId,
      keySecret: razorpayKeySecret,
      webhookSecret: razorpayWebhookSecret,
    });
    console.log("[Razorpay] Payment service initialized successfully");
  } else {
    console.warn("[Razorpay] Missing credentials - payment service not initialized");
    if (!razorpayKeyId) console.warn("  - Missing: RAZORPAY_KEY_ID");
    if (!razorpayKeySecret) console.warn("  - Missing: RAZORPAY_KEY_SECRET");
    if (!razorpayWebhookSecret) console.warn("  - Missing: RAZORPAY_WEBHOOK_SECRET");
  }

  // Razorpay webhook - must be registered BEFORE express.json() to access raw body
  app.post(
    "/api/webhooks/razorpay",
    express.raw({ type: "application/json", limit: "256kb" }),
    async (req, res) => {
      try {
        const rawBody = req.body.toString("utf8");
        req.body = JSON.parse(rawBody);
        await handleRazorpayWebhook(req, res);
      } catch {
        return res.status(400).json({ error: "Invalid webhook payload" });
      }
    }
  );

  // Stripe webhook must be registered BEFORE express.json() to access raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json", limit: "256kb" }),
    async (req, res) => {
      const signature = req.headers["stripe-signature"] as string;
      
      try {
        const event = verifyStripeSignature(
          req.body as string,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
        
        // Handle test events
        if (event.id.startsWith("evt_test_")) {
          console.log("[Webhook] Test event detected, returning verification response");
          return res.json({ verified: true });
        }
        
        await handleStripeWebhook(event);
        res.json({ received: true });
      } catch (error: any) {
        console.error("Webhook error:", error.message);
        // Never expose internal error details to clients
        res.status(400).json({ error: "Webhook signature verification failed" });
      }
    }
  );
  
  // Bound non-file request bodies to reduce memory-exhaustion risk.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // Keep the public Lumae preview animation on the same origin. The generic
  // storage route is intentionally intercepted by the deployment gateway,
  // while video elements need an actual MP4 response instead of a redirect.
  app.get("/api/trpc/preview-eagle.mp4", async (req, res) => {
    try {
      const signedUrl = await storageGetSignedUrl("lumae-eagle-eye-reveal-motion_672b5d27.mp4");
      const range = typeof req.headers.range === "string" ? req.headers.range : undefined;
      const upstream = await fetch(signedUrl, { headers: range ? { Range: range } : undefined });

      if (!upstream.ok) {
        console.error(`[PreviewMedia] eagle upstream error: ${upstream.status}`);
        return res.status(502).send("Preview media unavailable");
      }

      const contentLength = upstream.headers.get("content-length");
      const contentRange = upstream.headers.get("content-range");
      res.status(upstream.status === 206 ? 206 : 200);
      res.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
      res.set("Accept-Ranges", "bytes");
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      if (contentLength) res.set("Content-Length", contentLength);
      if (contentRange) res.set("Content-Range", contentRange);
      return res.send(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      console.error("[PreviewMedia] eagle delivery failed:", error);
      return res.status(502).send("Preview media unavailable");
    }
  });

  app.get("/api/trpc/preview-eagle-poster.png", async (_req, res) => {
    try {
      const signedUrl = await storageGetSignedUrl("lumae-eagle-eye-reveal-keyframe_699aa27b.png");
      const upstream = await fetch(signedUrl);

      if (!upstream.ok) {
        console.error(`[PreviewMedia] eagle poster upstream error: ${upstream.status}`);
        return res.status(502).send("Preview poster unavailable");
      }

      res.status(200);
      res.set("Content-Type", upstream.headers.get("content-type") || "image/png");
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      console.error("[PreviewMedia] eagle poster delivery failed:", error);
      return res.status(502).send("Preview poster unavailable");
    }
  });

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.post("/api/scheduled/social-automation", runScheduledAutomation);
  app.post("/api/scheduled/social-posts", runScheduledPosts);
  app.post("/api/scheduled/trends/refresh", refreshScheduledTrends);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Dev-only debug endpoint to inspect current session user
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/debug/me", async (req, res) => {
      try {
        const { sdk } = await import("./sdk");
        const { COOKIE_NAME } = await import("@shared/const");
        const cookies = req.headers.cookie || "";
        // Attempt to verify session cookie using configured cookie name
        const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`)) || [];
        const session = await sdk.verifySession(match[1]);
        res.json({ session });
      } catch (err) {
        console.error("/api/debug/me error:", err);
        res.status(500).json({ error: "failed" });
      }
    });
  }
  // development mode uses Vite, production mode uses static files
  // Dev-only helper: quick login route to create a session cookie for local development
  if (process.env.NODE_ENV !== "production") {
    app.get("/dev-login", async (req, res) => {
      try {
        const { sdk } = await import("./sdk");
        const { COOKIE_NAME } = await import("@shared/const");
        const { getSessionCookieOptions } = await import("./cookies");
        const { upsertUser } = await import("../db");

        const openId = "dev-openid-1";
        // Ensure user exists in DB
        await upsertUser({
          openId,
          name: "Dev User",
          email: "dev@example.com",
          loginMethod: "dev",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, { name: "Dev User" });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 30 });
        res.redirect("/");
      } catch (err) {
        console.error("/dev-login error:", err);
        res.status(500).send("Dev login failed");
      }
    });
  }

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Initialize automation engine after server starts
    initializeAutomationEngine().catch(console.error);
    ensureTrendRefreshJob().catch((error) => console.error("[Trend Refresh] Unable to register durable refresh job", error));
    if (process.env.NODE_ENV === "production") {
      ensureScheduledPostDispatcher().catch((error) => console.error("[Scheduled Posts] Unable to register durable dispatcher", error));
    }
  });
}

startServer().catch(console.error);
