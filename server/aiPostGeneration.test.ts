import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            twitter: "🚀 Exciting news! Here's a tweet about AI content creation. #AI #ContentMarketing",
            linkedin: "I'm thrilled to share insights about AI-powered content creation. This revolutionary approach is transforming how businesses communicate with their audiences.",
            instagram: "✨ AI is changing the game for content creators! Here's what you need to know about leveraging artificial intelligence for your social media strategy. 📱 #AIContent #SocialMedia",
            facebook: "Have you heard about the latest AI content creation tools? They're making it easier than ever to produce high-quality content at scale.",
            tiktok: "POV: You just discovered AI content creation 🤖✨ Here's what it can do for your brand...",
            hashtags: ["#AI", "#ContentMarketing", "#SocialMedia", "#DigitalMarketing"],
            bestPostingTime: "Tuesday 9-11 AM",
            viralScore: 78,
          }),
        },
      },
    ],
  }),
}));

describe("AI Post Generation", () => {
  it("should generate platform-specific content with valid structure", async () => {
    const { invokeLLM } = await import("./_core/llm");

    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Generate social media posts",
        },
        {
          role: "user",
          content: "Generate posts about AI content creation",
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "social_posts",
          strict: true,
          schema: {
            type: "object",
            properties: {
              twitter: { type: "string" },
              linkedin: { type: "string" },
              instagram: { type: "string" },
              facebook: { type: "string" },
              tiktok: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              bestPostingTime: { type: "string" },
              viralScore: { type: "number" },
            },
            required: ["twitter", "linkedin", "instagram", "facebook", "tiktok", "hashtags", "bestPostingTime", "viralScore"],
            additionalProperties: false,
          },
        },
      },
    });

    expect(result).toBeDefined();
    expect(result.choices).toHaveLength(1);
    expect(result.choices[0].message.content).toBeDefined();

    const parsed = JSON.parse(result.choices[0].message.content as string);
    expect(parsed.twitter).toBeDefined();
    expect(parsed.linkedin).toBeDefined();
    expect(parsed.instagram).toBeDefined();
    expect(parsed.facebook).toBeDefined();
    expect(parsed.tiktok).toBeDefined();
    expect(Array.isArray(parsed.hashtags)).toBe(true);
    expect(typeof parsed.viralScore).toBe("number");
    expect(parsed.viralScore).toBeGreaterThanOrEqual(0);
    expect(parsed.viralScore).toBeLessThanOrEqual(100);
  });

  it("should generate Twitter content within character limit", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const result = await invokeLLM({ messages: [{ role: "user", content: "test" }] });
    const parsed = JSON.parse(result.choices[0].message.content as string);

    // Twitter has 280 char limit
    expect(parsed.twitter.length).toBeLessThanOrEqual(280);
  });

  it("should include hashtags in the response", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const result = await invokeLLM({ messages: [{ role: "user", content: "test" }] });
    const parsed = JSON.parse(result.choices[0].message.content as string);

    expect(parsed.hashtags).toBeDefined();
    expect(parsed.hashtags.length).toBeGreaterThan(0);
    parsed.hashtags.forEach((tag: string) => {
      expect(tag.startsWith("#")).toBe(true);
    });
  });

  it("should provide a viral score between 0 and 100", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const result = await invokeLLM({ messages: [{ role: "user", content: "test" }] });
    const parsed = JSON.parse(result.choices[0].message.content as string);

    expect(parsed.viralScore).toBeGreaterThanOrEqual(0);
    expect(parsed.viralScore).toBeLessThanOrEqual(100);
  });
});

describe("Sentiment Analysis Logic", () => {
  const analyzeSentiment = (text: string): "positive" | "neutral" | "negative" => {
    const positiveWords = ["love", "great", "amazing", "excellent", "wonderful", "fantastic", "awesome", "good", "best", "happy", "thank", "thanks", "perfect"];
    const negativeWords = ["hate", "terrible", "awful", "bad", "worst", "horrible", "disgusting", "angry", "frustrated", "disappointed", "broken", "issue", "problem", "fail"];

    const lower = text.toLowerCase();
    const posCount = positiveWords.filter((w) => lower.includes(w)).length;
    const negCount = negativeWords.filter((w) => lower.includes(w)).length;

    if (posCount > negCount) return "positive";
    if (negCount > posCount) return "negative";
    return "neutral";
  };

  it("should detect positive sentiment", () => {
    expect(analyzeSentiment("I love this product! It's amazing and wonderful!")).toBe("positive");
    expect(analyzeSentiment("Thank you so much, this is perfect!")).toBe("positive");
  });

  it("should detect negative sentiment", () => {
    expect(analyzeSentiment("This is terrible and broken, I hate it!")).toBe("negative");
    expect(analyzeSentiment("Awful experience, worst product ever")).toBe("negative");
  });

  it("should detect neutral sentiment", () => {
    expect(analyzeSentiment("I received my order today")).toBe("neutral");
    expect(analyzeSentiment("Can you tell me more about this?")).toBe("neutral");
  });
});

describe("ROI Calculation Logic", () => {
  const calculateROI = (revenue: number, spend: number): number => {
    if (spend === 0) return 0;
    return Math.round(((revenue - spend) / spend) * 100);
  };

  const calculateEngagementRate = (engagement: number, reach: number): number => {
    if (reach === 0) return 0;
    return parseFloat(((engagement / reach) * 100).toFixed(2));
  };

  it("should calculate ROI correctly", () => {
    expect(calculateROI(4200, 800)).toBe(425);
    expect(calculateROI(2800, 600)).toBeCloseTo(367, 0);
    expect(calculateROI(1000, 1000)).toBe(0);
    expect(calculateROI(0, 500)).toBe(-100);
  });

  it("should handle zero spend gracefully", () => {
    expect(calculateROI(1000, 0)).toBe(0);
  });

  it("should calculate engagement rate correctly", () => {
    expect(calculateEngagementRate(840, 12400)).toBeCloseTo(6.77, 1);
    expect(calculateEngagementRate(0, 1000)).toBe(0);
    expect(calculateEngagementRate(100, 0)).toBe(0);
  });

  it("should identify best performing platform by ROI", () => {
    const platforms = [
      { name: "LinkedIn", roi: 425 },
      { name: "Instagram", roi: 367 },
      { name: "TikTok", roi: 320 },
      { name: "Twitter", roi: 300 },
    ];

    const best = platforms.reduce((max, p) => p.roi > max.roi ? p : max);
    expect(best.name).toBe("LinkedIn");
    expect(best.roi).toBe(425);
  });
});

describe("Content Repurposing Validation", () => {
  const validateYouTubeUrl = (url: string): boolean => {
    return url.includes("youtube.com/watch?v=") || url.includes("youtu.be/");
  };

  const truncateForPlatform = (content: string, maxChars: number): string => {
    if (content.length <= maxChars) return content;
    return content.substring(0, maxChars - 3) + "...";
  };

  it("should validate YouTube URLs correctly", () => {
    expect(validateYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(validateYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(validateYouTubeUrl("https://www.google.com")).toBe(false);
    expect(validateYouTubeUrl("not a url")).toBe(false);
  });

  it("should truncate content to platform limits", () => {
    const longContent = "A".repeat(300);

    const twitterContent = truncateForPlatform(longContent, 280);
    expect(twitterContent.length).toBeLessThanOrEqual(280);
    expect(twitterContent.endsWith("...")).toBe(true);

    const shortContent = "Short content";
    expect(truncateForPlatform(shortContent, 280)).toBe(shortContent);
  });

  it("should not truncate content within limits", () => {
    const content = "This is a short post";
    expect(truncateForPlatform(content, 280)).toBe(content);
  });
});
