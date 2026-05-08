import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const contentGenerationRouter = router({
  contentRewriter: router({
    rewrite: protectedProcedure
      .input(
        z.object({
          content: z.string().min(1),
          style: z.enum(["professional", "casual", "academic", "seo", "viral", "minimalist", "storytelling", "technical"]),
          toneLevel: z.number().min(0).max(100).optional().default(50),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const styleDescriptions: Record<string, string> = {
          professional: "Rewrite in a formal, business-appropriate tone suitable for corporate communications.",
          casual: "Rewrite in a friendly, conversational tone perfect for social media and informal settings.",
          academic: "Rewrite in an academic style with proper structure, citations, and detailed explanations.",
          seo: "Rewrite optimized for search engines with relevant keywords, meta descriptions, and improved readability.",
          viral: "Rewrite to be more engaging, shareable, and optimized for social media virality.",
          minimalist: "Condense to essential points while maintaining clarity and impact.",
          storytelling: "Rewrite as a narrative with compelling story arc and emotional engagement.",
          technical: "Rewrite with technical precision, detailed specifications, and professional terminology.",
        };

        const toneIntensity = input.toneLevel < 33 ? "subtle" : input.toneLevel < 66 ? "moderate" : "intense";

        const prompt = `You are a professional content rewriter. Rewrite the following content in the ${input.style} style with ${toneIntensity} tone intensity.

Style Description: ${styleDescriptions[input.style]}

Original Content:
${input.content}

Provide only the rewritten content without any explanations or preamble.`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an expert content rewriter. Rewrite content in the requested style while maintaining the core message and facts.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const rewrittenContent = response.choices[0]?.message?.content || "";
          if (typeof rewrittenContent !== "string") {
            throw new Error("Invalid response from LLM");
          }

          return {
            success: true,
            rewrittenContent,
            style: input.style,
            originalLength: input.content.length,
            rewrittenLength: rewrittenContent.length,
          };
        } catch (error) {
          console.error("Content rewriter error:", error);
          throw new Error("Failed to rewrite content. Please try again.");
        }
      }),
  }),

  contentRepurposer: router({
    repurpose: protectedProcedure
      .input(
        z.object({
          content: z.string().min(1),
          platforms: z.array(z.enum(["twitter", "linkedin", "instagram", "tiktok", "youtube", "email"])).min(1),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const platformLimits: Record<string, number> = {
          twitter: 280,
          linkedin: 3000,
          instagram: 2200,
          tiktok: 150,
          youtube: 5000,
          email: 10000,
        };

        const platformDescriptions: Record<string, string> = {
          twitter: "Short, punchy, with hashtags and emojis. Max 280 characters.",
          linkedin: "Professional, value-focused, with industry insights. Max 3000 characters.",
          instagram: "Engaging, visual-focused, with hashtags and call-to-action. Max 2200 characters.",
          tiktok: "Trendy, casual, with hooks and trending sounds. Max 150 characters.",
          youtube: "Detailed, SEO-optimized, with timestamps and links. Max 5000 characters.",
          email: "Persuasive, clear CTA, professional tone. Max 10000 characters.",
        };

        const result: Record<string, string> = {};

        for (const platform of input.platforms) {
          const limit = platformLimits[platform] || 1000;
          const description = platformDescriptions[platform] || "Adapt the content for this platform.";

          const prompt = `Adapt the following content for ${platform}. ${description}

Original Content:
${input.content}

Provide only the adapted content without any explanations. Keep it under ${limit} characters.`;

          try {
            const response = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `You are an expert content strategist. Adapt content for different social media platforms while maintaining the core message.`,
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
            });

            const adaptedContent = response.choices[0]?.message?.content || "";
            if (typeof adaptedContent !== "string") {
              throw new Error("Invalid response from LLM");
            }

            result[platform] = adaptedContent.substring(0, limit);
          } catch (error) {
            console.error(`Error repurposing for ${platform}:`, error);
            result[platform] = `[Error generating content for ${platform}]`;
          }
        }

        return {
          success: true,
          repurposedContent: result,
          platforms: input.platforms,
        };
      }),
  }),

  aiAssistant: router({
    chat: protectedProcedure
      .input(
        z.object({
          message: z.string().min(1),
          conversationHistory: z.array(z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })).optional().default([]),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const messages = [
            {
              role: "system" as const,
              content: `You are a powerful, knowledgeable AI assistant. You can answer ANY question on ANY topic - from content creation, marketing, business strategy, coding, science, history, math, health, relationships, career advice, to anything else the user asks.

Your capabilities:
- Answer all questions accurately and thoroughly
- Help with content creation, writing, brainstorming
- Provide advice on social media strategy, SEO, marketing
- Explain complex topics in simple terms
- Help with coding, technical problems, and debugging
- Provide creative ideas and solutions
- Give career and business advice
- Help with research and analysis
- Assist with planning and organization

Be conversational, helpful, and thorough. If you don't know something, say so honestly. Always provide actionable, practical answers. Format your responses with clear structure using markdown when helpful.`,
            },
            ...input.conversationHistory.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
            {
              role: "user" as const,
              content: input.message,
            },
          ];

          const response = await invokeLLM({
            messages,
          });

          const assistantMessage = response.choices[0]?.message?.content || "";
          if (typeof assistantMessage !== "string") {
            throw new Error("Invalid response from LLM");
          }

          return {
            success: true,
            message: assistantMessage,
          };
        } catch (error) {
          console.error("AI Assistant error:", error);
          throw new Error("Failed to process your message. Please try again.");
        }
      }),
  }),

  viralScore: router({
    analyze: protectedProcedure
      .input(
        z.object({
          content: z.string().min(1),
          platform: z.string().optional().default("general"),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prompt = `Analyze the viral potential of this content for ${input.platform}. Provide scores (0-100) for:
1. Hook Strength - How compelling is the opening?
2. Emotional Impact - How emotionally engaging is it?
3. Engagement Prediction - Likelihood of comments/shares
4. CTR Prediction - Click-through rate potential
5. Overall Viral Score - Combined viral potential

Also provide brief recommendations for improvement.

Content to analyze:
${input.content}

Respond in JSON format with scores and recommendations.`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a social media expert analyzing content for viral potential. Provide detailed analysis with specific scores and actionable recommendations.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: {
              type: "json_object",
            },
          });

          const content = response.choices[0]?.message?.content;
          if (typeof content !== "string") {
            throw new Error("Invalid response from LLM");
          }

          const analysis = JSON.parse(content);

          return {
            success: true,
            analysis: {
              viralScore: analysis.viral_score || analysis.overallViralScore || analysis["Overall Viral Score"] || 50,
              hookStrength: analysis.hook_strength || analysis.hookStrength || analysis["Hook Strength"] || 50,
              emotionalImpact: analysis.emotional_impact || analysis.emotionalImpact || analysis["Emotional Impact"] || 50,
              engagementPrediction: analysis.engagement_prediction || analysis.engagementPrediction || analysis["Engagement Prediction"] || 50,
              ctrPrediction: analysis.ctr_prediction || analysis.ctrPrediction || analysis["CTR Prediction"] || 50,
              recommendations: analysis.recommendations || analysis.Recommendations || [],
            },
          };
        } catch (error) {
          console.error("Viral score analysis error:", error);
          throw new Error("Failed to analyze viral potential. Please try again.");
        }
      }),
  }),

  brandVoice: router({
    generate: protectedProcedure
      .input(
        z.object({
          brandName: z.string().min(1),
          mission: z.string().min(1),
          targetAudience: z.string().min(1),
          tone: z.string().min(1),
          values: z.array(z.string()).optional().default([]),
          keywords: z.array(z.string()).optional().default([]),
          language: z.string().optional().default("en"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prompt = `Create a comprehensive brand voice profile for ${input.brandName}.

Brand Details:
- Mission: ${input.mission}
- Target Audience: ${input.targetAudience}
- Tone: ${input.tone}
- Core Values: ${input.values.join(", ")}
- Keywords: ${input.keywords.join(", ")}

Provide:
1. Brand Voice Summary
2. Messaging Pillars (3-5 key messages)
3. Tone Guidelines (do's and don'ts)
4. Example brand voice content
5. Consistency Checklist

Respond in JSON format with detailed brand voice guidelines.`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a brand strategist creating comprehensive brand voice guidelines. Provide actionable, specific guidance that can be used consistently across all content.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: {
              type: "json_object",
            },
          });

          const content = response.choices[0]?.message?.content;
          if (typeof content !== "string") {
            throw new Error("Invalid response from LLM");
          }

          const guidelines = JSON.parse(content);

          return {
            success: true,
            brandName: input.brandName,
            guidelines: {
              summary: guidelines.brand_voice_summary || guidelines.summary || guidelines["Brand Voice Summary"] || "",
              messagingPillars: guidelines.messaging_pillars || guidelines.messagingPillars || guidelines["Messaging Pillars"] || [],
              toneGuidelines: guidelines.tone_guidelines || guidelines.toneGuidelines || guidelines["Tone Guidelines"] || {},
              exampleContent: guidelines.example_brand_voice_content || guidelines.exampleContent || guidelines["Example brand voice content"] || "",
              consistencyChecklist: guidelines.consistency_checklist || guidelines.consistencyChecklist || guidelines["Consistency Checklist"] || [],
            },
          };
        } catch (error) {
          console.error("Brand voice generation error:", error);
          throw new Error("Failed to generate brand voice guidelines. Please try again.");
        }
      }),
  }),
});
