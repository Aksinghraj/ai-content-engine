import * as db from "../db";
export interface PlatformMetrics {
  platform: string;
  followers: number;
  engagement_rate: number;
  total_posts: number;
  avg_reach: number;
  avg_engagement: number;
  top_content_type: string;
  growth_rate: number;
}

export interface ContentPerformance {
  content_id: string;
  platform: string;
  title: string;
  reach: number;
  engagement: number;
  engagement_rate: number;
  shares: number;
  comments: number;
  likes: number;
  posted_at: Date;
  performance_score: number;
}

export interface ROIMetrics {
  total_revenue: number;
  total_costs: number;
  roi_percentage: number;
  revenue_per_post: number;
  cost_per_post: number;
  payback_period_days: number;
  platform_roi: Record<string, number>;
  dataAvailable?: boolean;
}

/**
 * Provider insight imports are not implemented in this service yet.  Returning
 * no metrics is intentional: connection or content-history records are not a
 * substitute for provider-measured reach, engagement, or follower counts.
 */
export async function fetchPlatformMetrics(_userId: string): Promise<PlatformMetrics[]> {
  return [];
}

/**
 * Do not infer publishing performance from generated content.  Performance is
 * reported only after a provider insight import stores measured values.
 */
export async function analyzeContentPerformance(_userId: string): Promise<{
  performance: ContentPerformance[];
  recommendations: string[];
}> {
  return {
    performance: [],
    recommendations: ["Measured analytics will appear after a supported provider insight import."],
  };
}

/**
 * ROI needs business revenue and cost inputs.  Lumae must not fabricate these
 * amounts from engagement rates or assumed conversion rates.
 */
export async function calculateROI(_userId: string, _timeframeMonths: number = 3): Promise<ROIMetrics> {
  return {
    total_revenue: 0,
    total_costs: 0,
    roi_percentage: 0,
    revenue_per_post: 0,
    cost_per_post: 0,
    payback_period_days: 0,
    platform_roi: {},
    dataAvailable: false,
  };
}

/**
 * Get trending topics and hashtags for user's niche
 */
export async function getTrendingInsights(_userId: string, _platform: string): Promise<{
  trending_topics: string[];
  recommended_hashtags: string[];
  best_posting_times: string[];
}> {
  return {
    trending_topics: [],
    recommended_hashtags: [],
    best_posting_times: [],
  };
}
