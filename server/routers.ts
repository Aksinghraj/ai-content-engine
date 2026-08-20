import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { saveContentHistory, getContentHistoryByUserId, getContentHistoryById, getTodayTokenUsage, trackTokenUsage } from "./db";
import { generateContentPackage } from "./_core/contentGenerator";
import { subscriptionRouter } from "./routers/subscription";
import { automationRouter } from "./routers/automation";
import { analyticsRouter } from "./routers/analytics";
import { creditsRouter } from "./routers/credits";
import { generateAutomationContent, AutomationType } from "./_core/automationGenerators";
import { eq, desc, and, gte } from "drizzle-orm";
import { contentGenerationRouter } from "./routers/contentGeneration";
import { trendingRouter } from "./routers/trending";
import { aiFeatureRouter } from "./routers/aiFeatures";
import { seoToolsRouter } from "./routers/seoTools";
import { multimodalRouter } from "./routers/multimodal";
import { workflowRouter } from "./routers/workflow";
import { publishingRouter } from "./routers/publishing";
import { personalizationRouter } from "./routers/personalization";
import { monetizationRouter } from "./routers/monetization";
import { securityRouter } from "./routers/security";
import { aiAgentsRouter } from "./routers/aiAgents";
import { templatesRouter } from "./routers/templates";
import { communityRouter } from "./routers/community";
import { socialOAuthRouter } from "./routers/socialOAuth";
import { oauthFlowRouter } from "./routers/oauthFlow";
import { socialMediaRouter } from "./routers/socialMedia";
import { enterpriseRouter } from "./routers/enterprise";
import { oauthManagementRouter } from "./routers/oauthManagement";
import { multilingualAIRouter } from "./routers/multilingualAI";
import { socialPostingRouter } from "./routers/socialPosting";
import { encryptionRouter } from "./routers/encryption";
import { aiPostGenerationRouter } from "./routers/aiPostGeneration";
import { aiMediaGeneration } from "./routers/aiMediaGeneration";
import { oauthCallbackRouter } from "./routers/oauthCallback";
import { socialOAuthIntegrationRouter } from "./routers/socialOAuthIntegration";
import { freeTierRouter } from "./routers/freeTier";
import { professionalProfileRouter } from "./routers/professionalProfile";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    account: accountDeletionRouter,
    me: publicProcedure.query(opts => {
      const user = opts.ctx.user;
      if (!user) return null;
      // Strip sensitive fields before returning to frontend
      const { emailVerificationToken, emailVerificationTokenExpiresAt, ...safeUser } = user;
      return safeUser;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const success = await db.verifyEmailToken(input.token);
        return { success };
      }),
    resendOtp: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { sendVerificationEmail } = await import("./_core/emailService");
        const otp = await db.generateEmailVerificationToken(ctx.user.id);
        const sent = await sendVerificationEmail(ctx.user.email ?? "", ctx.user.name ?? "", otp);
        return { success: sent };
      }),
  }),

  subscription: subscriptionRouter,
  automation: automationRouter,
  analytics: analyticsRouter,
  credits: creditsRouter,
  trending: trendingRouter,
  aiFeatures: aiFeatureRouter,
  seoTools: seoToolsRouter,
  multimodal: multimodalRouter,
  workflow: workflowRouter,
  publishing: publishingRouter,
  personalization: personalizationRouter,
  monetization: monetizationRouter,
  security: securityRouter,
  aiAgents: aiAgentsRouter,
  templates: templatesRouter,
  community: communityRouter,
  socialOAuth: socialOAuthRouter,
  oauthFlow: oauthFlowRouter,
  socialMedia: socialMediaRouter,
  enterprise: enterpriseRouter,
  oauthManagement: oauthManagementRouter,
  multilingualAI: multilingualAIRouter,
  socialPosting: socialPostingRouter,
  encryption: encryptionRouter,
  aiPostGeneration: aiPostGenerationRouter,
  professionalProfile: professionalProfileRouter,
  aiMediaGeneration: aiMediaGeneration,
  freeTier: freeTierRouter,
  oauth: oauthCallbackRouter,
  socialOAuthIntegration: socialOAuthIntegrationRouter,
  contentRewriter: contentGenerationRouter.contentRewriter,
  contentRepurposer: contentGenerationRouter.contentRepurposer,
  aiAssistant: contentGenerationRouter.aiAssistant,
  viralScore: contentGenerationRouter.viralScore,
  brandVoice: contentGenerationRouter.brandVoice,

  automationGenerators: router({
    generateBlog: protectedProcedure
      .input(
        z.object({
          niche: z.string().min(1),
          topic: z.string().min(1),
          tone: z.string().min(1),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.subscriptionTier !== "pro") {
          throw new Error("This feature is only available for Pro users");
        }
        return generateAutomationContent({
          ...input,
          platform: "blog",
        });
      }),

    generateTweets: protectedProcedure
      .input(
        z.object({
          niche: z.string().min(1),
          topic: z.string().min(1),
          tone: z.string().min(1),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.subscriptionTier !== "pro") {
          throw new Error("This feature is only available for Pro users");
        }
        return generateAutomationContent({
          ...input,
          platform: "tweet",
        });
      }),

    generateEmail: protectedProcedure
      .input(
        z.object({
          niche: z.string().min(1),
          topic: z.string().min(1),
          tone: z.string().min(1),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.subscriptionTier !== "pro") {
          throw new Error("This feature is only available for Pro users");
        }
        return generateAutomationContent({
          ...input,
          platform: "email",
        });
      }),

    generateInstagram: protectedProcedure
      .input(
        z.object({
          niche: z.string().min(1),
          topic: z.string().min(1),
          tone: z.string().min(1),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.subscriptionTier !== "pro") {
          throw new Error("This feature is only available for Pro users");
        }
        return generateAutomationContent({
          ...input,
          platform: "instagram",
        });
      }),

    generateFacebook: protectedProcedure
      .input(
        z.object({
          niche: z.string().min(1),
          topic: z.string().min(1),
          tone: z.string().min(1),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.subscriptionTier !== "pro") {
          throw new Error("This feature is only available for Pro users");
        }
        return generateAutomationContent({
          ...input,
          platform: "facebook",
        });
      }),
  }),

  content: router({
    generate: protectedProcedure
      .input(
        z.object({
          niche: z.string().min(1),
          targetAudience: z.string().min(1),
          platform: z.string().min(1),
          goal: z.string().min(1),
          contentStyle: z.string().min(1),
          language: z.string().optional().default("en"),
          videoLength: z.string().refine((value) => ["15s", "30s", "60s", "90s", "3min", "5min", "custom"].includes(value), "Invalid video length").optional().default("60s"),
          scriptLength: z.string().refine((value) => ["brief", "short", "medium", "long", "extended", "custom"].includes(value), "Invalid script length").optional().default("medium"),
          customVideoSeconds: z.number().int().min(5).max(3600).optional(),
          customScriptWordTarget: z.number().int().min(25).max(3000).optional(),
          trendingTopics: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        const FREE_GENERATION_LIMIT = 3;

        // Enforce free tier generation limit
        if (user.subscriptionTier !== "pro") {
          const stats = await db.getUserGenerationStats(user.id);
          const used = stats?.freeAiGenerationsUsed ?? 0;
          if (used >= FREE_GENERATION_LIMIT) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Free tier limit reached. You have used all ${FREE_GENERATION_LIMIT} free AI generations. Upgrade to Pro for unlimited access.`,
            });
          }
        }
        
        // Generate content
        const generatedContent = await generateContentPackage(input);
        
        // Save to history
        await saveContentHistory({
          userId: user.id,
          niche: input.niche,
          targetAudience: input.targetAudience,
          platform: input.platform,
          goal: input.goal,
          contentStyle: input.contentStyle,
          generatedContent: JSON.stringify(generatedContent),
        });
        
        // Track token usage and increment free generation counter
        await trackTokenUsage(user.id, 1);
        if (user.subscriptionTier !== "pro") {
          await db.incrementFreeAiGenerations(user.id);
        }
        
        return generatedContent;
      }),

    lengthPreferences: protectedProcedure.query(async ({ ctx }) => {
      return db.getGeneratorLengthPreference(ctx.user.id);
    }),

    saveLengthPreferences: protectedProcedure
      .input(z.object({
        videoLength: z.string().refine((value) => ["15s", "30s", "60s", "90s", "3min", "5min", "custom"].includes(value), "Invalid video length"),
        scriptLength: z.string().refine((value) => ["brief", "short", "medium", "long", "extended", "custom"].includes(value), "Invalid script length"),
        customVideoSeconds: z.number().int().min(5).max(3600).optional(),
        customScriptWordTarget: z.number().int().min(25).max(3000).optional(),
      }).superRefine((input, refinement) => {
        if (input.videoLength === "custom" && !input.customVideoSeconds) refinement.addIssue({ code: "custom", path: ["customVideoSeconds"], message: "A custom video duration is required" });
        if (input.scriptLength === "custom" && !input.customScriptWordTarget) refinement.addIssue({ code: "custom", path: ["customScriptWordTarget"], message: "A custom script word target is required" });
      }))
      .mutation(async ({ ctx, input }) => {
        const saved = await db.saveGeneratorLengthPreference(ctx.user.id, input);
        if (!saved) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to save length preferences" });
        return saved;
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      const history = await getContentHistoryByUserId(ctx.user.id);
      return history.map((item: any) => ({
        ...item,
        generatedContent: JSON.parse(item.generatedContent as string),
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const content = await getContentHistoryById(input.id);
        if (!content || content.userId !== ctx.user.id) {
          throw new Error("Content not found");
        }
        return {
          ...content,
          generatedContent: JSON.parse(content.generatedContent as string),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
import { accountDeletionRouter } from "./routers/accountDeletion";
