import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import { sendFeedbackResolvedEmail } from "../_core/emailService";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { createUserFeedback, getFeedbackForOwner, getLatestFeedbackForUser, getRecentFeedbackForUser, updateFeedbackStatus } from "../db/feedback";
import { storageGetSignedUrl, storagePut } from "../storage";

const screenshotInput = z.object({
  dataUrl: z.string().max(7_200_000),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  name: z.string().trim().min(1).max(255),
});

const feedbackInput = z.object({
  rating: z.number().int().min(1).max(5),
  category: z.enum(["glitch", "problem", "suggestion", "feature_request", "other"]),
  message: z.string().trim().min(10, "Please share at least 10 characters so we can understand the issue.").max(2_000, "Feedback must be 2,000 characters or fewer."),
  pagePath: z.string().trim().max(512).optional(),
  screenshot: screenshotInput.optional(),
});

const FEEDBACK_COOLDOWN_MS = 60_000;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

function decodeScreenshot(screenshot: z.infer<typeof screenshotInput>) {
  const match = screenshot.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[1] !== screenshot.mimeType) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Use a valid PNG, JPEG, or WebP screenshot." });
  }
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_SCREENSHOT_BYTES) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Screenshots must be 5 MB or smaller." });
  }
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if ((screenshot.mimeType === "image/png" && !isPng) || (screenshot.mimeType === "image/jpeg" && !isJpeg) || (screenshot.mimeType === "image/webp" && !isWebp)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The screenshot file does not match its declared image type." });
  }
  return bytes;
}

export const feedbackRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => getRecentFeedbackForUser(ctx.user.id)),
  submit: protectedProcedure.input(feedbackInput).mutation(async ({ ctx, input }) => {
    const latest = await getLatestFeedbackForUser(ctx.user.id);
    if (latest && Date.now() - latest.createdAt.getTime() < FEEDBACK_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((FEEDBACK_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1_000);
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Please wait ${retryAfterSeconds} seconds before submitting more feedback.`,
      });
    }

    if (input.screenshot && !["glitch", "problem"].includes(input.category)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Screenshots are available for glitch and problem reports only." });
    }
    let attachment: { key: string; mimeType: string; name: string } | undefined;
    if (input.screenshot) {
      const bytes = decodeScreenshot(input.screenshot);
      const extension = input.screenshot.mimeType === "image/png" ? "png" : input.screenshot.mimeType === "image/jpeg" ? "jpg" : "webp";
      const stored = await storagePut(`feedback/${ctx.user.id}/${crypto.randomUUID()}.${extension}`, bytes, input.screenshot.mimeType);
      attachment = { key: stored.key, mimeType: input.screenshot.mimeType, name: input.screenshot.name.replace(/[\r\n]/g, " ") };
    }

    const created = await createUserFeedback({
      userId: ctx.user.id,
      rating: input.rating,
      category: input.category,
      message: input.message,
      pagePath: input.pagePath,
      attachmentKey: attachment?.key,
      attachmentMimeType: attachment?.mimeType,
      attachmentName: attachment?.name,
    });
    const ownerNotified = await notifyOwner({
      title: `New Lumae feedback · ${input.category.replace("_", " ")}`,
      content: `Rating: ${input.rating}/5\nReporter: ${ctx.user.name || "Lumae user"}\nArea: ${input.pagePath || "Not specified"}\n\n${input.message}`,
    });
    return { id: created.id, ownerNotified, hasScreenshot: Boolean(attachment) };
  }),
  review: adminProcedure.input(z.object({
    status: z.enum(["new", "reviewed", "resolved"]).optional(),
    category: z.enum(["glitch", "problem", "suggestion", "feature_request", "other"]).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sortBy: z.enum(["createdAt", "rating"]).optional(),
    sortDirection: z.enum(["asc", "desc"]).optional(),
  }).optional()).query(async ({ input }) => {
    const feedback = await getFeedbackForOwner(input ?? {});
    return Promise.all(feedback.map(async (item) => ({
      ...item,
      attachmentUrl: item.attachmentKey ? await storageGetSignedUrl(item.attachmentKey) : null,
    })));
  }),
  updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "reviewed", "resolved"]) })).mutation(async ({ input }) => {
    const previous = await updateFeedbackStatus(input.id, input.status);
    if (!previous) throw new TRPCError({ code: "NOT_FOUND", message: "Feedback report not found." });
    const emailNotificationAttempted = input.status === "resolved" && previous.status !== "resolved" && Boolean(previous.userEmail);
    const emailAccepted = emailNotificationAttempted && previous.userEmail
      ? await sendFeedbackResolvedEmail({ to: previous.userEmail, userName: previous.userName, category: previous.category })
      : false;
    return { success: true, emailNotificationAttempted, emailAccepted };
  }),
});
