/**
 * Trending Data Service
 * Fetches real trending topics from various sources
 * For production, integrate with Twitter API, Google Trends, or other data providers
 */

export interface TrendingTopic {
  id: string;
  title: string;
  trendScore: number;
  growthPercentage: number;
  category: string;
  estimatedReach: string;
  platforms: string[];
  summary: string;
  relatedKeywords: string[];
  suggestedHooks: string[];
  bestPostingTime: string;
  externalTrendId?: string;
}

/**
 * Mock trending data - In production, replace with real API calls
 * TODO: Integrate with:
 * - Twitter API v2 for trending topics
 * - Google Trends API
 * - TikTok Discover API
 * - YouTube Trending API
 */
const MOCK_TRENDS: TrendingTopic[] = [
  {
    id: "trend-1",
    title: "AI-Powered Content Creation",
    trendScore: 95,
    growthPercentage: 156,
    category: "Money & AI",
    estimatedReach: "4.2M",
    platforms: ["twitter", "linkedin", "youtube"],
    summary:
      "Creators are increasingly using AI tools to generate content at scale. This trend shows no signs of slowing down as tools become more sophisticated.",
    relatedKeywords: ["AI", "content creation", "automation", "ChatGPT", "AI tools"],
    suggestedHooks: [
      "I used AI to create 30 posts in 1 hour...",
      "This AI tool just changed my content game forever",
      "How AI is replacing content creators (and how to adapt)",
    ],
    bestPostingTime: "2-4 PM IST",
  },
  {
    id: "trend-2",
    title: "Fitness Transformation Reels",
    trendScore: 92,
    growthPercentage: 142,
    category: "Health & Fitness",
    estimatedReach: "3.8M",
    platforms: ["instagram", "tiktok", "youtube"],
    summary:
      "Short-form fitness transformation videos are dominating social media. People love seeing real before-and-after stories with quick tips.",
    relatedKeywords: ["fitness", "transformation", "gym", "health", "motivation"],
    suggestedHooks: [
      "From 0 to fit in 90 days - here's how I did it",
      "This one exercise changed my entire physique",
      "Fitness trainers hate this one simple trick",
    ],
    bestPostingTime: "6-8 AM IST",
  },
  {
    id: "trend-3",
    title: "Viral Business Ideas 2026",
    trendScore: 88,
    growthPercentage: 128,
    category: "Money & AI",
    estimatedReach: "2.9M",
    platforms: ["twitter", "linkedin", "tiktok"],
    summary:
      "Entrepreneurs are sharing their latest side hustles and business ideas. The audience is hungry for actionable, scalable business concepts.",
    relatedKeywords: ["business", "entrepreneurship", "side hustle", "passive income", "startup"],
    suggestedHooks: [
      "I made $10k from this side hustle in 30 days",
      "This business idea is about to blow up",
      "The easiest way to start a business in 2026",
    ],
    bestPostingTime: "3-5 PM IST",
  },
  {
    id: "trend-4",
    title: "Sustainable Fashion Movement",
    trendScore: 85,
    growthPercentage: 115,
    category: "Lifestyle",
    estimatedReach: "2.5M",
    platforms: ["instagram", "tiktok", "youtube"],
    summary:
      "Eco-conscious fashion is trending as Gen Z demands sustainable options. Brands and creators are capitalizing on this shift.",
    relatedKeywords: ["sustainable fashion", "eco-friendly", "thrifting", "fashion", "sustainability"],
    suggestedHooks: [
      "I only buy sustainable fashion now - here's why",
      "This thrift store haul is insane",
      "Fast fashion is dead - here's what's replacing it",
    ],
    bestPostingTime: "7-9 PM IST",
  },
  {
    id: "trend-5",
    title: "Mental Health & Wellness Content",
    trendScore: 82,
    growthPercentage: 98,
    category: "Health & Fitness",
    estimatedReach: "3.2M",
    platforms: ["instagram", "tiktok", "youtube"],
    summary:
      "Mental health awareness content is resonating strongly with audiences. Creators sharing personal stories get high engagement.",
    relatedKeywords: ["mental health", "wellness", "anxiety", "depression", "self-care"],
    suggestedHooks: [
      "I quit my job for my mental health - here's what happened",
      "5 things nobody tells you about anxiety",
      "How I overcame burnout in 3 months",
    ],
    bestPostingTime: "8-10 PM IST",
  },
];

/**
 * Get trending topics for a specific region and category
 * @param region - Region code (e.g., 'IN' for India)
 * @param category - Optional category filter
 * @param limit - Number of trends to return
 */
export async function getTrendingTopics(
  region: string = "IN",
  category?: string,
  limit: number = 10
): Promise<TrendingTopic[]> {
  try {
    // TODO: Replace with real API call
    // const response = await fetch(`https://api.twitter.com/2/trends/by/woeid`, {
    //   headers: { Authorization: `Bearer ${process.env.TWITTER_API_KEY}` }
    // });

    let trends = [...MOCK_TRENDS];

    // Filter by category if provided
    if (category) {
      trends = trends.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    // Sort by trend score (descending)
    trends.sort((a, b) => b.trendScore - a.trendScore);

    // Return limited results
    return trends.slice(0, limit);
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return MOCK_TRENDS.slice(0, limit);
  }
}

/**
 * Get trending topics for a specific platform
 */
export async function getTrendingByPlatform(
  platform: "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin",
  limit: number = 10
): Promise<TrendingTopic[]> {
  try {
    const trends = MOCK_TRENDS.filter((t) => t.platforms.includes(platform)).sort(
      (a, b) => b.trendScore - a.trendScore
    );

    return trends.slice(0, limit);
  } catch (error) {
    console.error("Error fetching platform trends:", error);
    return [];
  }
}

/**
 * Search for trending topics by keyword
 */
export async function searchTrends(keyword: string): Promise<TrendingTopic[]> {
  try {
    const lowerKeyword = keyword.toLowerCase();
    return MOCK_TRENDS.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerKeyword) ||
        t.relatedKeywords.some((k) => k.toLowerCase().includes(lowerKeyword)) ||
        t.summary.toLowerCase().includes(lowerKeyword)
    ).sort((a, b) => b.trendScore - a.trendScore);
  } catch (error) {
    console.error("Error searching trends:", error);
    return [];
  }
}

/**
 * Get trending topics by category
 */
export async function getTrendingByCategory(category: string): Promise<TrendingTopic[]> {
  try {
    return MOCK_TRENDS.filter((t) => t.category.toLowerCase() === category.toLowerCase()).sort(
      (a, b) => b.trendScore - a.trendScore
    );
  } catch (error) {
    console.error("Error fetching category trends:", error);
    return [];
  }
}
