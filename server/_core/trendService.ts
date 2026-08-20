import { and, eq } from "drizzle-orm";
import { trendCache } from "../../drizzle/schema";
import { getDb } from "../db";
import { invokeLLM } from "./llm";

export const UNIFIED_TREND_CACHE_KEY = "unified_social_trends_v1";
export const TREND_CACHE_TTL_MS = 3 * 60 * 60 * 1000;

export type TrendSource = "youtube" | "instagram" | "facebook" | "tiktok" | "twitter";
export type TrendDataKind = "live" | "ai_estimated";

export type UnifiedTrend = {
  id: string;
  title: string;
  source: TrendSource;
  dataKind: TrendDataKind;
  category: "education" | "business" | "comedy" | "lifestyle" | "technology" | "creator";
  suggestedStyle: "Educational" | "Entertaining" | "Storytelling" | "Bold" | "Inspirational" | "Humorous";
  suggestedGoal: "Growth" | "Engagement" | "Sales" | "Authority" | "Brand Awareness";
  sourceUrl?: string;
  observedAt: string;
};

type CachedTrendPayload = { topics: UnifiedTrend[]; generatedAt: string };

const categoryFor = (value: string): UnifiedTrend["category"] => {
  const normalized = value.toLowerCase();
  if (/funny|comedy|prank|meme|humou?r/.test(normalized)) return "comedy";
  if (/business|money|market|startup|career|finance/.test(normalized)) return "business";
  if (/tech|ai|software|coding|gadget|phone/.test(normalized)) return "technology";
  if (/vlog|travel|food|fitness|fashion|life/.test(normalized)) return "lifestyle";
  if (/creator|content|video|podcast|editing|reel/.test(normalized)) return "creator";
  return "education";
};

export const recommendationForCategory = (category: UnifiedTrend["category"]): Pick<UnifiedTrend, "suggestedStyle" | "suggestedGoal"> => {
  if (category === "comedy") return { suggestedStyle: "Humorous", suggestedGoal: "Engagement" };
  if (category === "business" || category === "technology") return { suggestedStyle: "Educational", suggestedGoal: "Authority" };
  if (category === "lifestyle") return { suggestedStyle: "Storytelling", suggestedGoal: "Engagement" };
  if (category === "creator") return { suggestedStyle: "Bold", suggestedGoal: "Growth" };
  return { suggestedStyle: "Educational", suggestedGoal: "Authority" };
};

const safeYoutubeTopics = async (now: Date): Promise<UnifiedTrend[]> => {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey) return [];
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.search = new URLSearchParams({
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode: "IN",
    maxResults: "6",
    key: apiKey,
  }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`YouTube Data API returned ${response.status}`);
  const payload = await response.json() as { items?: Array<{ id?: string; snippet?: { title?: string } }> };
  return (payload.items ?? []).flatMap((video, index) => {
    const title = video.snippet?.title?.trim();
    if (!title) return [];
    const category = categoryFor(title);
    return [{
      id: `youtube-${video.id ?? index}`,
      title,
      source: "youtube" as const,
      dataKind: "live" as const,
      category,
      ...recommendationForCategory(category),
      sourceUrl: video.id ? `https://www.youtube.com/watch?v=${video.id}` : undefined,
      observedAt: now.toISOString(),
    }];
  });
};

const deterministicEstimatedTopics = (youtubeTopics: UnifiedTrend[], now: Date): UnifiedTrend[] => {
  const seeds = youtubeTopics.length ? youtubeTopics.slice(0, 4).map(topic => topic.title) : ["AI content workflows", "creator productivity", "short-form storytelling", "community engagement"];
  const sources: TrendSource[] = ["instagram", "facebook", "tiktok", "twitter"];
  return sources.flatMap((source, index) => {
    const title = seeds[index % seeds.length];
    const category = categoryFor(title);
    return [{
      id: `${source}-estimated-${index}`,
      title,
      source,
      dataKind: "ai_estimated" as const,
      category,
      ...recommendationForCategory(category),
      observedAt: now.toISOString(),
    }];
  });
};

const estimateUnsupportedPlatformTopics = async (youtubeTopics: UnifiedTrend[], now: Date): Promise<UnifiedTrend[]> => {
  const context = youtubeTopics.map(topic => topic.title).join(" | ") || "No live video titles were available";
  try {
    const result = await invokeLLM({
      model: "gpt-5-mini",
      maxTokens: 900,
      messages: [
        { role: "system", content: "Return concise, non-factual AI-estimated content themes. Never describe them as live trends or claim metric access." },
        { role: "user", content: `Using these current YouTube popular-video titles as context: ${context}\n\nSuggest exactly 8 broad social content themes distributed across instagram, facebook, tiktok, and twitter. Each title must be generic, safe, and under 72 characters. Return JSON only with { topics: [{ title, source, category, suggestedStyle, suggestedGoal }] }. category must be education, business, comedy, lifestyle, technology, or creator. suggestedStyle must be Educational, Entertaining, Storytelling, Bold, Inspirational, or Humorous. suggestedGoal must be Growth, Engagement, Sales, Authority, or Brand Awareness.` },
      ],
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "estimated_social_topics",
          strict: true,
          schema: {
            type: "object",
            properties: {
              topics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    source: { type: "string", enum: ["instagram", "facebook", "tiktok", "twitter"] },
                    category: { type: "string", enum: ["education", "business", "comedy", "lifestyle", "technology", "creator"] },
                    suggestedStyle: { type: "string", enum: ["Educational", "Entertaining", "Storytelling", "Bold", "Inspirational", "Humorous"] },
                    suggestedGoal: { type: "string", enum: ["Growth", "Engagement", "Sales", "Authority", "Brand Awareness"] },
                  },
                  required: ["title", "source", "category", "suggestedStyle", "suggestedGoal"],
                  additionalProperties: false,
                },
              },
            },
            required: ["topics"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = result.choices[0]?.message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) as { topics: Omit<UnifiedTrend, "id" | "dataKind" | "observedAt">[] } : null;
    if (!parsed?.topics?.length) return deterministicEstimatedTopics(youtubeTopics, now);
    return parsed.topics.slice(0, 8).map((topic, index) => ({
      ...topic,
      id: `${topic.source}-estimated-${index}`,
      dataKind: "ai_estimated" as const,
      observedAt: now.toISOString(),
    }));
  } catch (error) {
    console.warn("[Trend Service] AI estimation unavailable; using transparent deterministic estimates", { reason: error instanceof Error ? error.message : "unknown" });
    return deterministicEstimatedTopics(youtubeTopics, now);
  }
};

export async function refreshUnifiedTrends(force = false): Promise<CachedTrendPayload> {
  const db = await getDb();
  if (!db) throw new Error("Trend cache is unavailable");
  const now = new Date();
  const [cached] = await db.select().from(trendCache).where(eq(trendCache.cacheKey, UNIFIED_TREND_CACHE_KEY)).limit(1);
  if (!force && cached && cached.expiresAt.getTime() > now.getTime()) return cached.payload as CachedTrendPayload;

  let youtubeTopics: UnifiedTrend[] = [];
  try {
    youtubeTopics = await safeYoutubeTopics(now);
  } catch (error) {
    console.warn("[Trend Service] Live YouTube fetch unavailable", { reason: error instanceof Error ? error.message : "unknown" });
  }
  const estimatedTopics = await estimateUnsupportedPlatformTopics(youtubeTopics, now);
  const payload: CachedTrendPayload = { topics: [...youtubeTopics, ...estimatedTopics], generatedAt: now.toISOString() };
  const expiresAt = new Date(now.getTime() + TREND_CACHE_TTL_MS);
  await db.insert(trendCache).values({ cacheKey: UNIFIED_TREND_CACHE_KEY, payload, generatedAt: now, expiresAt }).onDuplicateKeyUpdate({ set: { payload, generatedAt: now, expiresAt } });
  return payload;
}

export async function getUnifiedTrends(limit: number): Promise<CachedTrendPayload> {
  const payload = await refreshUnifiedTrends(false);
  return { ...payload, topics: payload.topics.slice(0, limit) };
}
