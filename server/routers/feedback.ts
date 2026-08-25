import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import { protectedProcedure, router } from "../_core/trpc";
import { createUserFeedback, getLatestFeedbackForUser, getRecentFeedbackForUser } from "../db/feedback";

const feedbackInput = z.object({
  rating: z.number().int().min(1).max(5),
  category: z.enum(["glitch", "problem", "suggestion", "feature_request", "other"]),
  message: z.string().trim().min(10, "Please share at least 10 characters so we can understand the issue.").max(2_000, "Feedback must be 2,000 characters or fewer."),
  pagePath: z.string().trim().max(512).optional(),
});

const FEEDBACK_COOLDOWN_MS = 60_000;

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

    const created = await createUserFeedback({ ...input, userId: ctx.user.id });
    const ownerNotified = await notifyOwner({
      title: `New Lumae feedback · ${input.category.replace("_", " ")}`,
      content: `Rating: ${input.rating}/5\nReporter: ${ctx.user.name || "Lumae user"}\nArea: ${input.pagePath || "Not specified"}\n\n${input.message}`,
    });
    return { id: created.id, ownerNotified };
  }),
});
