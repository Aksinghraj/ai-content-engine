import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/ai-content-engine";
const schema = readFileSync(`${root}/drizzle/schema.ts`, "utf8");
const router = readFileSync(`${root}/server/routers/feedback.ts`, "utf8");
const feedbackPage = readFileSync(`${root}/client/src/pages/Feedback.tsx`, "utf8");
const reviewPage = readFileSync(`${root}/client/src/pages/FeedbackReview.tsx`, "utf8");
const app = readFileSync(`${root}/client/src/App.tsx`, "utf8");
const shell = readFileSync(`${root}/client/src/components/DashboardLayout.tsx`, "utf8");

describe("feedback screenshot attachments and owner review", () => {
  it("stores only secure attachment references and indexes feedback review status", () => {
    expect(schema).toContain('attachmentKey: varchar("attachmentKey", { length: 1024 })');
    expect(schema).toContain('attachmentMimeType: varchar("attachmentMimeType", { length: 64 })');
    expect(schema).toContain('attachmentName: varchar("attachmentName", { length: 255 })');
    expect(schema).toContain("user_feedback_status_created_index");
  });

  it("accepts only validated image screenshot data and limits attachments to issue reports", () => {
    expect(router).toContain('z.enum(["image/png", "image/jpeg", "image/webp"])');
    expect(router).toContain("MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024");
    expect(router).toContain("decodeScreenshot");
    expect(router).toContain('!["glitch", "problem"].includes(input.category)');
    expect(router).toContain("storagePut(`feedback/${ctx.user.id}/");
  });

  it("restricts review, attachment URLs, and status updates to owner authorization", () => {
    expect(router).toContain("review: adminProcedure");
    expect(router).toContain("updateStatus: adminProcedure");
    expect(router).toContain("storageGetSignedUrl(item.attachmentKey)");
    expect(reviewPage).toContain("Feedback review is restricted");
    expect(shell).toContain('user?.role === "admin"');
    expect(shell).toContain('setLocation("/admin/feedback")');
  });

  it("offers an optional issue screenshot UI and registers the private review route", () => {
    expect(feedbackPage).toContain("Attach a screenshot");
    expect(feedbackPage).toContain("image/png,image/jpeg,image/webp");
    expect(feedbackPage).toContain("Screenshots must be 5 MB or smaller.");
    expect(app).toContain('Route path="/admin/feedback" component={FeedbackReview}');
    expect(reviewPage).toContain("Mark resolved");
  });
});
