import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as enterprise from "../db/enterprise";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";

export const enterpriseRouter = router({
  /**
   * Engagement Events
   */
  createEngagementEvent: protectedProcedure
    .input(z.object({
      socialConnectionId: z.number(),
      platform: z.string(),
      eventType: z.enum(["comment", "dm", "like", "share", "mention"]),
      authorName: z.string(),
      authorId: z.string(),
      content: z.string(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      sentimentScore: z.number().optional(),
      intent: z.enum(["question", "praise", "support_issue", "spam", "other"]),
      postId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await enterprise.createEngagementEvent({
          userId: ctx.user.id,
          ...input,
          sentimentScore: (input.sentimentScore || 0.5).toString(),
        });
        return { success: true, eventId: (result as any).insertId || 0 };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create engagement event",
        });
      }
    }),

  getEngagementEvents: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        return await enterprise.getEngagementEvents(ctx.user.id, input.limit);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch engagement events",
        });
      }
    }),

  getEscalatedEvents: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await enterprise.getEscalatedEvents(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch escalated events",
      });
    }
  }),

  /**
   * Knowledge Base
   */
  createKnowledgeBase: protectedProcedure
    .input(z.object({
      title: z.string(),
      content: z.string(),
      category: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await enterprise.createKnowledgeBase({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, id: (result as any).insertId || 0 };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create knowledge base entry",
        });
      }
    }),

  getKnowledgeBase: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await enterprise.getKnowledgeBase(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch knowledge base",
      });
    }
  }),

  /**
   * Auto-Reply Rules
   */
  createAutoReplyRule: protectedProcedure
    .input(z.object({
      intent: z.enum(["question", "praise", "support_issue", "spam", "other"]),
      platform: z.string().optional(),
      replyTemplate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await enterprise.createAutoReplyRule({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, id: (result as any).insertId || 0 };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create auto-reply rule",
        });
      }
    }),

  getAutoReplyRules: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await enterprise.getAutoReplyRules(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch auto-reply rules",
      });
    }
  }),

  /**
   * Generate Auto-Reply using AI
   */
  generateAutoReply: protectedProcedure
    .input(z.object({
      commentContent: z.string(),
      intent: z.enum(["question", "praise", "support_issue", "spam", "other"]),
      platform: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const knowledgeBase = await enterprise.getKnowledgeBase(ctx.user.id);
        const knowledgeContext = knowledgeBase
          .map(kb => `${kb.title}: ${kb.content}`)
          .join("\n\n");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a social media assistant. Generate a professional, friendly reply to a ${input.intent} comment on ${input.platform}. 
              
Knowledge Base:
${knowledgeContext}

Keep the reply concise (1-2 sentences max for social media).`,
            },
            {
              role: "user",
              content: `Comment: "${input.commentContent}"\n\nGenerate an appropriate reply.`,
            },
          ],
        });

        const replyText = response.choices[0].message.content || "";
        return { success: true, reply: replyText };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate auto-reply",
        });
      }
    }),

  /**
   * Repurposed Content
   */
  createRepurposedContent: protectedProcedure
    .input(z.object({
      sourceUrl: z.string().url(),
      sourceType: z.enum(["youtube_video", "article", "podcast"]),
      transcription: z.string().optional(),
      linkedinPost: z.string().optional(),
      facebookPost: z.string().optional(),
      tiktokScript: z.string().optional(),
      instagramCaption: z.string().optional(),
      youtubeDescription: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await enterprise.createRepurposedContent({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, id: (result as any).insertId || 0 };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create repurposed content",
        });
      }
    }),

  getRepurposedContent: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await enterprise.getRepurposedContent(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch repurposed content",
      });
    }
  }),

  /**
   * Generate Cross-Platform Content
   */
  generateCrossPlatformContent: protectedProcedure
    .input(z.object({
      sourceUrl: z.string().url(),
      sourceType: z.enum(["youtube_video", "article", "podcast"]),
      originalContent: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a content repurposing expert. Convert the given content into platform-specific formats.
              
Return a JSON object with these keys:
- linkedinPost: Professional thought-leadership post (150-300 words)
- facebookPost: Engaging community post (100-200 words)
- tiktokScript: Short, punchy script (30-60 seconds of speaking)
- instagramCaption: Visual-focused caption with hashtags (50-150 words)
- youtubeDescription: Detailed description (100-200 words)`,
            },
            {
              role: "user",
              content: `Original content:\n${input.originalContent}\n\nGenerate cross-platform content as JSON.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "cross_platform_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  linkedinPost: { type: "string" },
                  facebookPost: { type: "string" },
                  tiktokScript: { type: "string" },
                  instagramCaption: { type: "string" },
                  youtubeDescription: { type: "string" },
                },
                required: ["linkedinPost", "facebookPost", "tiktokScript", "instagramCaption", "youtubeDescription"],
                additionalProperties: false,
              },
            },
          },
        });

        const messageContent = response.choices[0].message.content;
        const content = typeof messageContent === 'string' ? JSON.parse(messageContent) : JSON.parse(JSON.stringify(messageContent));
        
        // Save to database
        const result = await enterprise.createRepurposedContent({
          userId: ctx.user.id,
          sourceUrl: input.sourceUrl,
          sourceType: input.sourceType,
          transcription: input.originalContent,
          linkedinPost: content.linkedinPost,
          facebookPost: content.facebookPost,
          tiktokScript: content.tiktokScript,
          instagramCaption: content.instagramCaption,
          youtubeDescription: content.youtubeDescription,
        });

        return { success: true, id: (result as any).insertId || 0, content };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate cross-platform content",
        });
      }
    }),

  /**
   * Platform Analytics
   */
  getPlatformAnalytics: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        return await enterprise.getPlatformAnalytics(ctx.user.id, input.days);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch platform analytics",
        });
      }
    }),

  /**
   * Nuelink Integration
   */
  setupNeulinkIntegration: protectedProcedure
    .input(z.object({
      apiToken: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if already exists
        const existing = await enterprise.getNeulinkIntegration(ctx.user.id);
        
        if (existing) {
          await enterprise.updateNeulinkIntegration(existing.id, {
            apiToken: input.apiToken,
            isActive: true,
            lastSyncedAt: new Date(),
          });
          return { success: true, id: existing.id, isNew: false };
        }

        const result = await enterprise.createNeulinkIntegration({
          userId: ctx.user.id,
          apiToken: input.apiToken,
          isActive: true,
        });
        return { success: true, id: (result as any).insertId || 0, isNew: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to setup Nuelink integration",
        });
      }
    }),

  getNeulinkStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const integration = await enterprise.getNeulinkIntegration(ctx.user.id);
      return {
        isConnected: !!integration,
        lastSyncedAt: integration?.lastSyncedAt,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch Nuelink status",
      });
    }
  }),

  /**
   * Sentiment Analysis
   */
  analyzeSentiment: protectedProcedure
    .input(z.object({
      text: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Analyze the sentiment of the given text. Return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- score: 0.0 to 1.0 (0 = very negative, 1 = very positive)
- intent: "question", "praise", "support_issue", "spam", or "other"`,
            },
            {
              role: "user",
              content: `Analyze: "${input.text}"`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "sentiment_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                  score: { type: "number", minimum: 0, maximum: 1 },
                  intent: { type: "string", enum: ["question", "praise", "support_issue", "spam", "other"] },
                },
                required: ["sentiment", "score", "intent"],
                additionalProperties: false,
              },
            },
          },
        });

        const analysisContent = response.choices[0].message.content;
        const analysis = typeof analysisContent === 'string' ? JSON.parse(analysisContent) : JSON.parse(JSON.stringify(analysisContent));
        return { success: true, ...analysis };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze sentiment",
        });
      }
    }),
});
