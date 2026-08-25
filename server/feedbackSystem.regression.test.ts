import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/ai-content-engine";
const schema = readFileSync(`${root}/drizzle/schema.ts`, "utf8");
const router = readFileSync(`${root}/server/routers/feedback.ts`, "utf8");
const page = readFileSync(`${root}/client/src/pages/Feedback.tsx`, "utf8");
const app = readFileSync(`${root}/client/src/App.tsx`, "utf8");
const shell = readFileSync(`${root}/client/src/components/DashboardLayout.tsx`, "utf8");

describe("user feedback and rating system", () => {
  it("persists only structured authenticated feedback with a status and per-user lookup index", () => {
    expect(schema).toContain('export const userFeedback = mysqlTable("userFeedback"');
    expect(schema).toContain('mysqlEnum("category", ["glitch", "problem", "suggestion", "feature_request", "other"])');
    expect(schema).toContain('mysqlEnum("status", ["new", "reviewed", "resolved"])');
    expect(schema).toContain('user_feedback_user_created_index');
  });

  it("protects submission, validates the payload, throttles repeats, and notifies only the owner channel", () => {
    expect(router).toContain("protectedProcedure.input(feedbackInput).mutation");
    expect(router).toContain("rating: z.number().int().min(1).max(5)");
    expect(router).toContain("message: z.string().trim().min(10");
    expect(router).toContain("FEEDBACK_COOLDOWN_MS = 60_000");
    expect(router).toContain('code: "TOO_MANY_REQUESTS"');
    expect(router).toContain("notifyOwner({");
  });

  it("exposes a direct authenticated feedback route and account-menu entry", () => {
    expect(app).toContain('Route path="/feedback" component={Feedback}');
    expect(app).toContain('"/feedback"');
    expect(shell).toContain('setLocation("/feedback")');
    expect(shell).toContain("Send feedback");
  });

  it("provides accessible rating, category, privacy, and submission feedback controls", () => {
    expect(page).toContain('role="radiogroup"');
    expect(page).toContain('aria-checked={rating === value}');
    expect(page).toContain('Please do not include passwords, verification codes, API keys');
    expect(page).toContain('role="alert"');
    expect(page).toContain('role="status"');
    expect(page).toContain("Your recent reports");
  });
});
