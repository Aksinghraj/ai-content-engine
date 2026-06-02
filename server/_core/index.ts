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
import { initializeAutomationEngine } from "./automationEngine";

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

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Dev: log incoming requests for debugging
  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      console.log(`[DEV-LOG] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      next();
    });
  }
  
  // Stripe webhook must be registered BEFORE express.json() to access raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
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
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    }
  );
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
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
  });
}

startServer().catch(console.error);
