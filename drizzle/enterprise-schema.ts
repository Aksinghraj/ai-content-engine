import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  json,
  uuid,
  varchar,
  enum as pgEnum,
  uniqueIndex,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

// ============================================================================
// CORE TABLES
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    avatar: text("avatar"),
    passwordHash: text("password_hash"),
    role: pgEnum("role", ["user", "admin", "enterprise"]).default("user"),
    subscriptionTier: pgEnum("subscription_tier", ["free", "pro", "agency", "enterprise"]).default("free"),
    credits: integer("credits").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    ssoProvider: varchar("sso_provider", { length: 50 }), // google, microsoft, okta
    ssoId: varchar("sso_id", { length: 255 }),
    dataOwnershipAgreed: boolean("data_ownership_agreed").default(false),
    gdprConsent: boolean("gdpr_consent").default(false),
    hipaaCompliant: boolean("hipaa_compliant").default(false),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    ssoIdx: uniqueIndex("users_sso_idx").on(table.ssoProvider, table.ssoId),
  })
);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    ownerId: uuid("owner_id").notNull(),
    description: text("description"),
    logo: text("logo"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    whitelabelEnabled: boolean("whitelabel_enabled").default(false),
    customDomain: varchar("custom_domain", { length: 255 }),
  }
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: pgEnum("role", ["owner", "editor", "manager", "viewer"]).default("viewer"),
    joinedAt: timestamp("joined_at").defaultNow(),
  }
);

// ============================================================================
// CONTENT & PROJECTS
// ============================================================================

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    folderId: uuid("folder_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    archivedAt: timestamp("archived_at"),
  }
);

export const folders = pgTable(
  "folders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    parentFolderId: uuid("parent_folder_id"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const contents = pgTable(
  "contents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull(),
    teamId: uuid("team_id").notNull(),
    createdBy: uuid("created_by").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body").notNull(),
    contentType: pgEnum("content_type", [
      "blog",
      "email",
      "social",
      "product_description",
      "real_estate",
      "legal",
      "medical",
      "academic",
      "youtube_script",
      "cold_email",
      "other",
    ]).default("blog"),
    status: pgEnum("status", ["draft", "pending_review", "approved", "published", "archived"]).default("draft"),
    aiModel: varchar("ai_model", { length: 50 }).default("gpt-4o"), // gpt-4o, claude, gemini, llama, mistral
    tags: json("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    publishedAt: timestamp("published_at"),
    scheduledAt: timestamp("scheduled_at"),
  }
);

export const contentVersions = pgTable(
  "content_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body").notNull(),
    changedBy: uuid("changed_by").notNull(),
    changeDescription: text("change_description"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const contentComments = pgTable(
  "content_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    userId: uuid("user_id").notNull(),
    text: text("text").notNull(),
    mentionedUsers: json("mentioned_users").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// ============================================================================
// BRAND VOICE & PERSONALIZATION
// ============================================================================

export const brandVoices = pgTable(
  "brand_voices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    tone: varchar("tone", { length: 100 }), // professional, casual, academic, etc.
    vocabulary: text("vocabulary"), // JSON of common words/phrases
    style: text("style"), // Writing style description
    examples: json("examples").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

export const buyerPersonas = pgTable(
  "buyer_personas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    demographics: json("demographics").$type<Record<string, any>>().default({}),
    psychographics: json("psychographics").$type<Record<string, any>>().default({}),
    painPoints: json("pain_points").$type<string[]>().default([]),
    goals: json("goals").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// ============================================================================
// SEO & KEYWORD RESEARCH
// ============================================================================

export const keywords = pgTable(
  "keywords",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    keyword: varchar("keyword", { length: 500 }).notNull(),
    searchVolume: integer("search_volume"),
    keywordDifficulty: integer("keyword_difficulty"), // 0-100
    cpc: decimal("cpc", { precision: 10, scale: 2 }),
    trend: json("trend").$type<Record<string, number>>().default({}),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

export const serpAnalysis = pgTable(
  "serp_analysis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    keyword: varchar("keyword", { length: 500 }).notNull(),
    topResults: json("top_results").$type<Array<{
      rank: number;
      title: string;
      url: string;
      snippet: string;
      domain: string;
    }>>().default([]),
    serpFeatures: json("serp_features").$type<string[]>().default([]), // featured snippet, knowledge panel, etc.
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

export const seoScores = pgTable(
  "seo_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    overallScore: integer("overall_score"), // 0-100
    keywordOptimization: integer("keyword_optimization"),
    readability: integer("readability"),
    technicalSeo: integer("technical_seo"),
    contentLength: integer("content_length"),
    recommendations: json("recommendations").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const schemaMarkup = pgTable(
  "schema_markup",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    schemaType: pgEnum("schema_type", ["faq", "article", "product", "organization", "breadcrumb"]).default("article"),
    schemaJson: json("schema_json").$type<Record<string, any>>().default({}),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// ============================================================================
// AI DETECTION & PLAGIARISM
// ============================================================================

export const aiDetectionResults = pgTable(
  "ai_detection_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    humanScore: decimal("human_score", { precision: 5, scale: 2 }), // 0-100
    aiScore: decimal("ai_score", { precision: 5, scale: 2 }), // 0-100
    turnitinScore: decimal("turnitin_score", { precision: 5, scale: 2 }),
    gptzeroScore: decimal("gptzero_score", { precision: 5, scale: 2 }),
    originalityScore: decimal("originality_score", { precision: 5, scale: 2 }),
    recommendations: json("recommendations").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const plagiarismResults = pgTable(
  "plagiarism_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    plagiarismPercentage: decimal("plagiarism_percentage", { precision: 5, scale: 2 }),
    sources: json("sources").$type<Array<{
      url: string;
      percentage: number;
      title: string;
    }>>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const factCheckResults = pgTable(
  "fact_check_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    claims: json("claims").$type<Array<{
      claim: string;
      verified: boolean;
      sources: string[];
      confidence: number;
    }>>().default([]),
    overallAccuracy: decimal("overall_accuracy", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// ============================================================================
// MULTIMODAL CONTENT
// ============================================================================

export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id"),
    teamId: uuid("team_id").notNull(),
    url: text("url").notNull(),
    prompt: text("prompt"),
    aiModel: varchar("ai_model", { length: 50 }), // dall-e, stable-diffusion, midjourney
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id"),
    teamId: uuid("team_id").notNull(),
    url: text("url").notNull(),
    prompt: text("prompt"),
    aiModel: varchar("ai_model", { length: 50 }), // sora, runway, pika
    duration: integer("duration"), // in seconds
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const voiceovers = pgTable(
  "voiceovers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id"),
    teamId: uuid("team_id").notNull(),
    url: text("url").notNull(),
    text: text("text").notNull(),
    voice: varchar("voice", { length: 100 }), // voice name from ElevenLabs
    language: varchar("language", { length: 10 }).default("en"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const avatarVideos = pgTable(
  "avatar_videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id"),
    teamId: uuid("team_id").notNull(),
    url: text("url").notNull(),
    avatarId: varchar("avatar_id", { length: 100 }),
    script: text("script"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const podcasts = pgTable(
  "podcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id"),
    teamId: uuid("team_id").notNull(),
    url: text("url").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    speakers: json("speakers").$type<string[]>().default([]),
    duration: integer("duration"), // in seconds
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// ============================================================================
// PUBLISHING & INTEGRATIONS
// ============================================================================

export const publishingIntegrations = pgTable(
  "publishing_integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    platform: pgEnum("platform", [
      "wordpress",
      "shopify",
      "webflow",
      "wix",
      "medium",
      "ghost",
      "linkedin",
      "twitter",
      "instagram",
      "facebook",
      "tiktok",
      "youtube",
    ]).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    connectedAt: timestamp("connected_at").defaultNow(),
    isActive: boolean("is_active").default(true),
  }
);

export const publishedContent = pgTable(
  "published_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    platform: varchar("platform", { length: 50 }).notNull(),
    externalId: varchar("external_id", { length: 255 }),
    url: text("url"),
    publishedAt: timestamp("published_at").defaultNow(),
    status: pgEnum("status", ["published", "scheduled", "failed"]).default("published"),
  }
);

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    url: text("url").notNull(),
    events: json("events").$type<string[]>().default([]),
    secret: varchar("secret", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// ============================================================================
// APPROVAL WORKFLOWS
// ============================================================================

export const approvalWorkflows = pgTable(
  "approval_workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    contentId: uuid("content_id").notNull(),
    currentStep: integer("current_step").default(0),
    steps: json("steps").$type<Array<{
      step: number;
      role: string;
      approver: string;
      status: "pending" | "approved" | "rejected";
      feedback?: string;
    }>>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    completedAt: timestamp("completed_at"),
  }
);

// ============================================================================
// ANALYTICS & PERFORMANCE
// ============================================================================

export const contentAnalytics = pgTable(
  "content_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    views: integer("views").default(0),
    clicks: integer("clicks").default(0),
    conversions: integer("conversions").default(0),
    engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).default(0),
    bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default(0),
    avgTimeOnPage: integer("avg_time_on_page").default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

export const competitorTracking = pgTable(
  "competitor_tracking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    competitorUrl: text("competitor_url").notNull(),
    competitorName: varchar("competitor_name", { length: 255 }),
    lastAnalyzedAt: timestamp("last_analyzed_at"),
    contentAnalysis: json("content_analysis").$type<Record<string, any>>().default({}),
  }
);

// ============================================================================
// SUBSCRIPTIONS & PAYMENTS
// ============================================================================

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    plan: pgEnum("plan", ["free", "pro", "agency", "enterprise"]).default("free"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    status: pgEnum("status", ["active", "canceled", "past_due", "trialing"]).default("active"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    canceledAt: timestamp("canceled_at"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    amount: integer("amount").notNull(),
    type: pgEnum("type", ["purchase", "usage", "refund", "bonus"]).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: pgEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).default("draft"),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at").defaultNow(),
    paidAt: timestamp("paid_at"),
  }
);

// ============================================================================
// REFERRAL & AFFILIATE
// ============================================================================

export const referrals = pgTable(
  "referrals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id").notNull(),
    referredId: uuid("referred_id"),
    referralCode: varchar("referral_code", { length: 50 }).unique(),
    status: pgEnum("status", ["pending", "completed", "expired"]).default("pending"),
    commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }).default(30),
    commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).default(0),
    createdAt: timestamp("created_at").defaultNow(),
    completedAt: timestamp("completed_at"),
  }
);

// ============================================================================
// AI AGENTS & AUTOMATION
// ============================================================================

export const automationRules = pgTable(
  "automation_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: pgEnum("type", [
      "blog_agent",
      "seo_agent",
      "social_manager",
      "newsletter_agent",
      "custom",
    ]).notNull(),
    config: json("config").$type<Record<string, any>>().default({}),
    isActive: boolean("is_active").default(true),
    schedule: varchar("schedule", { length: 100 }), // cron expression
    lastRun: timestamp("last_run"),
    nextRun: timestamp("next_run"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const automationLogs = pgTable(
  "automation_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    automationRuleId: uuid("automation_rule_id").notNull(),
    status: pgEnum("status", ["success", "failed", "running"]).notNull(),
    output: json("output").$type<Record<string, any>>().default({}),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const customGpts = pgTable(
  "custom_gpts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    systemPrompt: text("system_prompt"),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// ============================================================================
// TEMPLATES & MARKETPLACE
// ============================================================================

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id"),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    content: text("content"),
    isPublic: boolean("is_public").default(false),
    price: decimal("price", { precision: 10, scale: 2 }).default(0),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const templatePurchases = pgTable(
  "template_purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    templateId: uuid("template_id").notNull(),
    purchasedAt: timestamp("purchased_at").defaultNow(),
  }
);

// ============================================================================
// COMPLIANCE & SECURITY
// ============================================================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", { length: 100 }),
    resourceId: uuid("resource_id"),
    details: json("details").$type<Record<string, any>>().default({}),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const dataExportRequests = pgTable(
  "data_export_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    status: pgEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
    downloadUrl: text("download_url"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// ============================================================================
// COMMUNITY & LEARNING
// ============================================================================

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    content: text("content"),
    isFree: boolean("is_free").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const courseEnrollments = pgTable(
  "course_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    courseId: uuid("course_id").notNull(),
    progress: integer("progress").default(0),
    enrolledAt: timestamp("enrolled_at").defaultNow(),
    completedAt: timestamp("completed_at"),
  }
);

export const communityPosts = pgTable(
  "community_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 100 }),
    upvotes: integer("upvotes").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const promptLibrary = pgTable(
  "prompt_library",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    prompt: text("prompt").notNull(),
    category: varchar("category", { length: 100 }),
    rating: decimal("rating", { precision: 3, scale: 2 }).default(0),
    usageCount: integer("usage_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// ============================================================================
// GAMIFICATION
// ============================================================================

export const userStreaks = pgTable(
  "user_streaks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    currentStreak: integer("current_streak").default(0),
    longestStreak: integer("longest_streak").default(0),
    lastActivityAt: timestamp("last_activity_at"),
  }
);

export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    badgeName: varchar("badge_name", { length: 100 }).notNull(),
    earnedAt: timestamp("earned_at").defaultNow(),
  }
);

export const userXp = pgTable(
  "user_xp",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    totalXp: integer("total_xp").default(0),
    level: integer("level").default(1),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// ============================================================================
// RANK GUARANTEE & INSURANCE
// ============================================================================

export const rankGuarantees = pgTable(
  "rank_guarantees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    keyword: varchar("keyword", { length: 500 }).notNull(),
    targetRank: integer("target_rank").default(10),
    guaranteeExpiresAt: timestamp("guarantee_expires_at"),
    currentRank: integer("current_rank"),
    status: pgEnum("status", ["active", "achieved", "failed", "refunded"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const contentInsurance = pgTable(
  "content_insurance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull(),
    penaltyDetected: boolean("penalty_detected").default(false),
    penaltyType: varchar("penalty_type", { length: 100 }),
    rewriteRequested: boolean("rewrite_requested").default(false),
    rewriteCompletedAt: timestamp("rewrite_completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Export all tables for use in the application
export const allTables = {
  users,
  teams,
  teamMembers,
  projects,
  folders,
  contents,
  contentVersions,
  contentComments,
  brandVoices,
  buyerPersonas,
  keywords,
  serpAnalysis,
  seoScores,
  schemaMarkup,
  aiDetectionResults,
  plagiarismResults,
  factCheckResults,
  images,
  videos,
  voiceovers,
  avatarVideos,
  podcasts,
  publishingIntegrations,
  publishedContent,
  webhooks,
  approvalWorkflows,
  contentAnalytics,
  competitorTracking,
  subscriptions,
  creditTransactions,
  invoices,
  referrals,
  automationRules,
  automationLogs,
  customGpts,
  templates,
  templatePurchases,
  auditLogs,
  dataExportRequests,
  courses,
  courseEnrollments,
  communityPosts,
  promptLibrary,
  userStreaks,
  userBadges,
  userXp,
  rankGuarantees,
  contentInsurance,
};
