import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import { TrpcContext } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

// Mock the LLM
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

const mockUser = {
  id: "test-user-123",
  email: "test@example.com",
  subscriptionTier: "free" as const,
  role: "user" as const,
};

const createMockContext = (): TrpcContext => ({
  user: mockUser,
  req: {
    headers: {
      origin: "http://localhost:3000",
    },
  } as any,
  res: {} as any,
});

describe("Content Generation Routers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("contentRewriter.rewrite", () => {
    it("should rewrite content in professional style", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "This is a professionally rewritten version of the content.",
            },
          },
        ],
      };

      vi.mocked(invokeLLM).mockResolvedValueOnce(mockResponse as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.contentRewriter.rewrite({
        content: "Hey, check this out!",
        style: "professional",
        toneLevel: 50,
      });

      expect(result.success).toBe(true);
      expect(result.rewrittenContent).toBe("This is a professionally rewritten version of the content.");
      expect(result.style).toBe("professional");
      expect(result.originalLength).toBe(20); // "Hey, check this out!" = 20 chars
      expect(result.rewrittenLength).toBeGreaterThan(0);
    });

    it("should handle different rewrite styles", async () => {
      const styles = ["casual", "academic", "seo", "viral", "minimalist", "storytelling", "technical"];

      for (const style of styles) {
        vi.mocked(invokeLLM).mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: `Content rewritten in ${style} style.`,
              },
            },
          ],
        } as any);

        const caller = appRouter.createCaller(createMockContext());

        const result = await caller.contentRewriter.rewrite({
          content: "Test content",
          style: style as any,
          toneLevel: 50,
        });

        expect(result.success).toBe(true);
        expect(result.style).toBe(style);
      }
    });

    it("should respect tone level parameter", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "Intensely rewritten content.",
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.contentRewriter.rewrite({
        content: "Test content",
        style: "viral",
        toneLevel: 90,
      });

      expect(result.success).toBe(true);
      expect(vi.mocked(invokeLLM)).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining("intense"),
            }),
          ]),
        })
      );
    });

    it("should throw error on invalid content", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.contentRewriter.rewrite({
          content: "",
          style: "professional",
        })
      ).rejects.toThrow();
    });

    it("should handle LLM errors gracefully", async () => {
      vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("LLM service error"));

      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.contentRewriter.rewrite({
          content: "Test content",
          style: "professional",
        })
      ).rejects.toThrow("Failed to rewrite content");
    });
  });

  describe("contentRepurposer.repurpose", () => {
    it("should repurpose content for multiple platforms", async () => {
      vi.mocked(invokeLLM)
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: "Check this out! #AI #Tech",
              },
            },
          ],
        } as any)
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: "Here's an interesting take on AI technology...",
              },
            },
          ],
        } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.contentRepurposer.repurpose({
        content: "This is a long-form article about AI technology",
        platforms: ["twitter", "linkedin"],
      });

      expect(result.success).toBe(true);
      expect(result.repurposedContent.twitter).toBeDefined();
      expect(result.repurposedContent.linkedin).toBeDefined();
      expect(result.platforms).toEqual(["twitter", "linkedin"]);
    });

    it("should respect platform character limits", async () => {
      const longContent = "A".repeat(300);

      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: longContent,
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.contentRepurposer.repurpose({
        content: "Test content",
        platforms: ["twitter"],
      });

      expect(result.success).toBe(true);
      expect(result.repurposedContent.twitter.length).toBeLessThanOrEqual(280);
    });

    it("should handle multiple platform repurposing", async () => {
      const platforms = ["twitter", "linkedin", "instagram", "tiktok", "youtube", "email"];

      platforms.forEach(() => {
        vi.mocked(invokeLLM).mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: "Adapted content for platform",
              },
            },
          ],
        } as any);
      });

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.contentRepurposer.repurpose({
        content: "Test content",
        platforms: platforms as any,
      });

      expect(result.success).toBe(true);
      expect(Object.keys(result.repurposedContent).length).toBe(6);
    });

    it("should throw error on empty platforms", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.contentRepurposer.repurpose({
          content: "Test content",
          platforms: [],
        })
      ).rejects.toThrow();
    });
  });

  describe("aiAssistant.chat", () => {
    it("should respond to user messages", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "I can help you with content creation!",
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.aiAssistant.chat({
        message: "How can you help me?",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("I can help you with content creation!");
    });

    it("should maintain conversation history", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "Based on what you said earlier, here's my response.",
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.aiAssistant.chat({
        message: "What do you think?",
        conversationHistory: [
          {
            role: "user",
            content: "I'm working on a blog post",
          },
          {
            role: "assistant",
            content: "That sounds interesting!",
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(vi.mocked(invokeLLM)).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: "I'm working on a blog post",
            }),
          ]),
        })
      );
    });

    it("should handle empty conversation history", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "Hello! How can I assist you?",
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.aiAssistant.chat({
        message: "Hello",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it("should throw error on empty message", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.aiAssistant.chat({
          message: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("viralScore.analyze", () => {
    it("should analyze viral potential with scores", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                viral_score: 85,
                hook_strength: 90,
                emotional_impact: 75,
                engagement_prediction: 80,
                ctr_prediction: 5,
                recommendations: ["Add more emotional appeal", "Strengthen the hook"],
              }),
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.viralScore.analyze({
        content: "Check out this amazing content!",
      });

      expect(result.success).toBe(true);
      expect(result.analysis.viralScore).toBe(85);
      expect(result.analysis.hookStrength).toBe(90);
      expect(result.analysis.emotionalImpact).toBe(75);
      expect(result.analysis.engagementPrediction).toBe(80);
      expect(result.analysis.ctrPrediction).toBe(5);
      expect(result.analysis.recommendations).toHaveLength(2);
    });

    it("should handle missing recommendation fields", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                viral_score: 70,
              }),
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.viralScore.analyze({
        content: "Test content",
      });

      expect(result.success).toBe(true);
      expect(result.analysis.viralScore).toBe(70);
      expect(result.analysis.hookStrength).toBe(50); // Default value
      expect(result.analysis.recommendations).toEqual([]);
    });

    it("should throw error on invalid JSON response", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "Invalid JSON",
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.viralScore.analyze({
          content: "Test content",
        })
      ).rejects.toThrow();
    });
  });

  describe("brandVoice.generate", () => {
    it("should generate brand voice guidelines", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                brand_voice_summary: "Professional yet approachable tech brand",
                messaging_pillars: ["Innovation", "Reliability", "Customer-first"],
                tone_guidelines: {
                  do: ["Use clear language", "Be authentic"],
                  dont: ["Use jargon", "Be overly formal"],
                },
                example_brand_voice_content: "We believe in making technology accessible.",
                consistency_checklist: ["Check tone", "Verify brand values"],
              }),
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.brandVoice.generate({
        brandName: "TechCorp",
        mission: "Empower through technology",
        targetAudience: "Tech-savvy professionals",
        tone: "professional",
        values: ["Innovation", "Integrity"],
        keywords: ["cutting-edge", "reliable"],
      });

      expect(result.success).toBe(true);
      expect(result.brandName).toBe("TechCorp");
      expect(result.guidelines.summary).toBe("Professional yet approachable tech brand");
      expect(result.guidelines.messagingPillars).toHaveLength(3);
    });

    it("should handle missing optional fields", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                brand_voice_summary: "Brand summary",
              }),
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.brandVoice.generate({
        brandName: "MyBrand",
        mission: "Our mission",
        targetAudience: "Everyone",
        tone: "casual",
      });

      expect(result.success).toBe(true);
      expect(result.guidelines.summary).toBe("Brand summary");
      expect(result.guidelines.messagingPillars).toEqual([]);
    });

    it("should throw error on missing required fields", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.brandVoice.generate({
          brandName: "",
          mission: "Mission",
          targetAudience: "Audience",
          tone: "casual",
        })
      ).rejects.toThrow();
    });

    it("should handle arrays of values and keywords", async () => {
      vi.mocked(invokeLLM).mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                brand_voice_summary: "Summary",
              }),
            },
          },
        ],
      } as any);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.brandVoice.generate({
        brandName: "Brand",
        mission: "Mission",
        targetAudience: "Audience",
        tone: "professional",
        values: ["Value1", "Value2", "Value3"],
        keywords: ["keyword1", "keyword2"],
      });

      expect(result.success).toBe(true);
      expect(vi.mocked(invokeLLM)).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining("Value1"),
            }),
          ]),
        })
      );
    });
  });
});
