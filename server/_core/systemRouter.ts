import { z } from "zod";
import { notifyOwner } from "./notification";
import { sendContactFormEmail } from "./emailService";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  sendContactMessage: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "name is required").max(100, "name is too long"),
        email: z.string().email("invalid email address"),
        subject: z.string().min(1, "subject is required").max(200, "subject is too long"),
        message: z.string().min(10, "message must be at least 10 characters").max(5000, "message is too long"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Send email to owner
        const ownerEmailSent = await sendContactFormEmail({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
        });

        return {
          success: ownerEmailSent,
          message: ownerEmailSent ? "Message sent successfully" : "Message queued but email delivery may be delayed",
        } as const;
      } catch (error) {
        console.error("Error sending contact message:", error);
        throw new Error("Failed to send message. Please try again later.");
      }
    }),
});
