import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
          videoLength: z.string().optional().default("60s"),
          scriptLength: z.string().optional().default("medium"),
          trendingTopics: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        
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
        
        // Track token usage
        await trackTokenUsage(user.id, 1);
        
        return generatedContent;
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
