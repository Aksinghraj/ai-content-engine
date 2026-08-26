import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, date, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Subscription tier: 'free' or 'pro'
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro"]).default("free").notNull(),
  // Token balance for free tier users
  tokenBalance: int("tokenBalance").default(100).notNull(),
  // Stripe customer ID for Pro users
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  // Stripe subscription ID for Pro users
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  // Theme preference: 'light', 'dark', 'auto'
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).default("auto").notNull(),
  // Optional accessibility contrast mode, independent of the selected color scheme.
  highContrast: boolean("highContrast").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Email verification
  emailVerified: boolean("emailVerified").default(false).notNull(),
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }),
  emailVerificationTokenExpiresAt: timestamp("emailVerificationTokenExpiresAt"),
  // Free AI text generation counter (max 3 for free tier)
  freeAiGenerationsUsed: int("freeAiGenerationsUsed").default(0).notNull(),
  // Credits for image/video generation (free users get 5 to start)
  imageVideoCredits: int("imageVideoCredits").default(5).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * One encrypted TOTP authenticator per account. The seed is never returned to
 * the browser after enrollment; recovery codes are stored only as keyed hashes.
 */
export const twoFactorAuthenticators = mysqlTable("twoFactorAuthenticators", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  encryptedSecret: text("encryptedSecret").notNull(),
  recoveryCodeHashes: json("recoveryCodeHashes"),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  enabledAt: timestamp("enabledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex("two_factor_authenticators_user_unique").on(table.userId),
}));

export type TwoFactorAuthenticator = typeof twoFactorAuthenticators.$inferSelect;

/** Public WebAuthn credential metadata. Private key material never leaves the authenticator. */
export const webAuthnPasskeys = mysqlTable("webAuthnPasskeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  credentialId: varchar("credentialId", { length: 512 }).notNull(),
  publicKey: text("publicKey").notNull(),
  counter: int("counter").default(0).notNull(),
  deviceType: varchar("deviceType", { length: 32 }).notNull(),
  backedUp: boolean("backedUp").default(false).notNull(),
  transports: json("transports"),
  name: varchar("name", { length: 80 }).notNull().default("Passkey"),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  credentialUnique: uniqueIndex("web_authn_passkeys_credential_unique").on(table.credentialId),
  userIndex: uniqueIndex("web_authn_passkeys_user_credential_unique").on(table.userId, table.credentialId),
}));

/** One short-lived server-side challenge per user and WebAuthn ceremony type. */
export const webAuthnCeremonies = mysqlTable("webAuthnCeremonies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  challenge: varchar("challenge", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userTypeUnique: uniqueIndex("web_authn_ceremonies_user_type_unique").on(table.userId, table.type),
}));

export type WebAuthnPasskey = typeof webAuthnPasskeys.$inferSelect;

/** Opaque, HMAC-hashed device tokens that may bypass a second-factor prompt until expiry. */
export const trustedDevices = mysqlTable("trustedDevices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tokenUnique: uniqueIndex("trusted_devices_token_unique").on(table.tokenHash),
  userIndex: uniqueIndex("trusted_devices_user_expiry_unique").on(table.userId, table.expiresAt),
}));

/** Customer contacts owned by a Business workspace; consent is explicit per channel. */
export const businessContacts = mysqlTable("businessContacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  source: varchar("source", { length: 120 }).notNull().default("manual"),
  emailConsent: boolean("emailConsent").default(false).notNull(),
  emailConsentAt: timestamp("emailConsentAt"),
  whatsappConsent: boolean("whatsappConsent").default(false).notNull(),
  whatsappConsentAt: timestamp("whatsappConsentAt"),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userEmailUnique: uniqueIndex("business_contacts_user_email_unique").on(table.userId, table.email),
  userPhoneUnique: uniqueIndex("business_contacts_user_phone_unique").on(table.userId, table.phone),
}));

/** Immutable user-owned audit trail for explicit consent changes. */
export const businessConsentEvents = mysqlTable("businessConsentEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId").notNull(),
  channel: mysqlEnum("channel", ["email", "whatsapp"]).notNull(),
  action: mysqlEnum("action", ["granted", "withdrawn"]).notNull(),
  source: varchar("source", { length: 120 }).notNull().default("manual"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Provider-facing WhatsApp Business state; credentials remain absent until official onboarding completes. */
export const whatsappBusinessConnections = mysqlTable("whatsappBusinessConnections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["not_configured", "ready_to_link", "linking", "connected", "needs_reconnect", "error"]).default("not_configured").notNull(),
  wabaId: varchar("wabaId", { length: 255 }),
  phoneNumberId: varchar("phoneNumberId", { length: 255 }),
  displayPhoneNumber: varchar("displayPhoneNumber", { length: 40 }),
  encryptedBusinessToken: text("encryptedBusinessToken"),
  lastError: varchar("lastError", { length: 255 }),
  connectedAt: timestamp("connectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex("whatsapp_business_connections_user_unique").on(table.userId),
}));

/** Local email/password credential material. Passwords and verification tokens are never stored in plaintext. */
export const localAuthCredentials = mysqlTable("localAuthCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  verificationTokenHash: varchar("verificationTokenHash", { length: 128 }),
  verificationExpiresAt: timestamp("verificationExpiresAt"),
  verifiedAt: timestamp("verifiedAt"),
  lastResetRequestedAt: timestamp("lastResetRequestedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex("local_auth_credentials_user_unique").on(table.userId),
  verificationTokenUnique: uniqueIndex("local_auth_credentials_verification_token_unique").on(table.verificationTokenHash),
}));

/** Single-use, SHA-256-hashed local password reset links. Raw reset tokens never enter storage. */
export const localPasswordResetTokens = mysqlTable("localPasswordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tokenUnique: uniqueIndex("local_password_reset_tokens_token_unique").on(table.tokenHash),
  userIndex: index("local_password_reset_tokens_user_index").on(table.userId),
}));

/** Monotonic local-session version used to invalidate every email/password session after a reset. */
export const localAuthSessionVersions = mysqlTable("localAuthSessionVersions", {
  userId: int("userId").primaryKey(),
  version: int("version").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Authenticated product feedback. Stores only the reporting user, their rating, and the details they chose to submit. */
export const userFeedback = mysqlTable("userFeedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  category: mysqlEnum("category", ["glitch", "problem", "suggestion", "feature_request", "other"]).notNull(),
  message: text("message").notNull(),
  pagePath: varchar("pagePath", { length: 512 }),
  attachmentKey: varchar("attachmentKey", { length: 1024 }),
  attachmentMimeType: varchar("attachmentMimeType", { length: 64 }),
  attachmentName: varchar("attachmentName", { length: 255 }),
  status: mysqlEnum("status", ["new", "reviewed", "resolved"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userCreatedIndex: index("user_feedback_user_created_index").on(table.userId, table.createdAt),
  statusCreatedIndex: index("user_feedback_status_created_index").on(table.status, table.createdAt),
}));

export type UserFeedback = typeof userFeedback.$inferSelect;

/**
 * Professional profile fields are stored separately from the authentication
 * record. Profiles are private by default; only non-sensitive fields are
 * exposed through the public sharing route when explicitly enabled.
 */
export const professionalProfiles = mysqlTable("professionalProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  professionalTitle: varchar("professionalTitle", { length: 180 }).notNull().default("Content Strategist & AI Workflow Builder"),
  biography: text("biography"),
  expertise: text("expertise"),
  availability: varchar("availability", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  location: varchar("location", { length: 120 }),
  website: varchar("website", { length: 500 }),
  avatarUrl: text("avatarUrl"),
  coverUrl: text("coverUrl"),
  socialLinks: json("socialLinks"),
  username: varchar("username", { length: 80 }),
  profileStatus: varchar("profileStatus", { length: 100 }),
  collaborationOpen: boolean("collaborationOpen").default(false).notNull(),
  profileTheme: varchar("profileTheme", { length: 32 }).default("signal").notNull(),
  coverPreset: varchar("coverPreset", { length: 32 }).default("aurora").notNull(),
  publicSlug: varchar("publicSlug", { length: 100 }),
  isPublic: boolean("isPublic").default(false).notNull(),
  shareSocialLinks: boolean("shareSocialLinks").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex("professional_profiles_user_unique").on(table.userId),
  usernameUnique: uniqueIndex("professional_profiles_username_unique").on(table.username),
  publicSlugUnique: uniqueIndex("professional_profiles_public_slug_unique").on(table.publicSlug),
}));

export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = typeof professionalProfiles.$inferInsert;

/** Aggregate public profile page views by owner and UTC calendar day.
 * No visitor identifier, IP address, or user agent is collected. */
export const professionalProfileViews = mysqlTable("professionalProfileViews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  viewDate: date("viewDate").notNull(),
  views: int("views").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerDateUnique: uniqueIndex("professional_profile_views_owner_date_unique").on(table.userId, table.viewDate),
}));

export type ProfessionalProfileView = typeof professionalProfileViews.$inferSelect;

/** Aggregate Lumae Light Pulse introduction dismissals by UTC calendar day.
 * This table intentionally stores no user, session, device, IP, or user-agent data. */
export const lumaePulseIntroDismissals = mysqlTable("lumaePulseIntroDismissals", {
  id: int("id").autoincrement().primaryKey(),
  dismissalDate: date("dismissalDate").notNull(),
  dismissals: int("dismissals").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dateUnique: uniqueIndex("lumae_pulse_intro_dismissals_date_unique").on(table.dismissalDate),
}));

export type LumaePulseIntroDismissal = typeof lumaePulseIntroDismissals.$inferSelect;

/**
 * Content generation history table.
 * Stores all content packages generated by users for session-based retrieval.
 */
export const contentHistory = mysqlTable("contentHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  niche: varchar("niche", { length: 255 }).notNull(),
  targetAudience: varchar("targetAudience", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  goal: varchar("goal", { length: 100 }).notNull(),
  contentStyle: varchar("contentStyle", { length: 100 }).notNull(),
  generatedContent: json("generatedContent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = typeof contentHistory.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  contentHistory: many(contentHistory),
}));

export const contentHistoryRelations = relations(contentHistory, ({ one }) => ({
  user: one(users, {
    fields: [contentHistory.userId],
    references: [users.id],
  }),
}));

/**
 * Token usage tracking table.
 * Tracks daily token consumption for free tier users.
 */
export const tokenUsage = mysqlTable("tokenUsage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokensUsed: int("tokensUsed").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenUsage = typeof tokenUsage.$inferSelect;
export type InsertTokenUsage = typeof tokenUsage.$inferInsert;

/**
 * Automation schedules table for Pro users.
 * Stores scheduled content generation tasks.
 */
export const automationSchedules = mysqlTable("automationSchedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  niche: varchar("niche", { length: 255 }).notNull(),
  targetAudience: varchar("targetAudience", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  goal: varchar("goal", { length: 100 }).notNull(),
  contentStyle: varchar("contentStyle", { length: 100 }).notNull(),
  // Optional Lumae-managed asset for providers that require image or video media.
  mediaUrl: varchar("mediaUrl", { length: 2048 }),
  mediaType: mysqlEnum("mediaType", ["image", "video"]),
  // Cron expression for scheduling
  cronExpression: varchar("cronExpression", { length: 100 }).notNull(),
  // Manus Heartbeat task UID; durable schedule lifecycle is keyed by this value.
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }).unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomationSchedule = typeof automationSchedules.$inferSelect;
export type InsertAutomationSchedule = typeof automationSchedules.$inferInsert;

// Add relations for new tables
export const tokenUsageRelations = relations(tokenUsage, ({ one }) => ({
  user: one(users, {
    fields: [tokenUsage.userId],
    references: [users.id],
  }),
}));

export const automationSchedulesRelations = relations(automationSchedules, ({ one }) => ({
  user: one(users, {
    fields: [automationSchedules.userId],
    references: [users.id],
  }),
}));

// Update users relations to include new tables
export const usersRelationsUpdated = relations(users, ({ many }) => ({
  contentHistory: many(contentHistory),
  tokenUsage: many(tokenUsage),
  automationSchedules: many(automationSchedules),
}));
/**
 * Automation execution logs table.
 * Tracks when automations run and their results.
 */
export const automationExecutionLogs = mysqlTable("automationExecutionLogs", {
  id: int("id").autoincrement().primaryKey(),
  scheduleId: int("scheduleId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  generatedContent: json("generatedContent"),
  errorMessage: text("errorMessage"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutomationExecutionLog = typeof automationExecutionLogs.$inferSelect;
export type InsertAutomationExecutionLog = typeof automationExecutionLogs.$inferInsert;

/**
 * Content performance analytics table.
 * Tracks engagement metrics for generated content.
 */
export const contentAnalytics = mysqlTable("contentAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentHistoryId: int("contentHistoryId"),
  platform: varchar("platform", { length: 100 }).notNull(),
  engagement: int("engagement").default(0).notNull(),
  reach: int("reach").default(0).notNull(),
  conversions: int("conversions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentAnalytics = typeof contentAnalytics.$inferSelect;
export type InsertContentAnalytics = typeof contentAnalytics.$inferInsert;

// Relations for new tables
export const automationExecutionLogsRelations = relations(automationExecutionLogs, ({ one }) => ({
  user: one(users, {
    fields: [automationExecutionLogs.userId],
    references: [users.id],
  }),
  schedule: one(automationSchedules, {
    fields: [automationExecutionLogs.scheduleId],
    references: [automationSchedules.id],
  }),
}));

export const contentAnalyticsRelations = relations(contentAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [contentAnalytics.userId],
    references: [users.id],
  }),
  contentHistory: one(contentHistory, {
    fields: [contentAnalytics.contentHistoryId],
    references: [contentHistory.id],
  }),
}));


/**
 * Password reset tokens table.
 * Stores temporary tokens for password reset functionality.
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * User credits table.
 * Tracks credit balance and transactions for Pro users.
 */
export const userCredits = mysqlTable("userCredits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: int("balance").default(0).notNull(),
  totalPurchased: int("totalPurchased").default(0).notNull(),
  totalUsed: int("totalUsed").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserCredit = typeof userCredits.$inferSelect;
export type InsertUserCredit = typeof userCredits.$inferInsert;

/**
 * Credit transactions table.
 * Logs all credit purchases and usage.
 */
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "refund"]).notNull(),
  amount: int("amount").notNull(),
  description: text("description"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  relatedContentId: int("relatedContentId"), // For usage transactions, link to content generation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Free actions are tracked independently from credits.
 * The Basic Script Generation quota uses a rolling 24-hour window starting on
 * the first successful free generation in that window.
 */
export const dailyFreeActions = mysqlTable("dailyFreeActions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  actionType: varchar("actionType", { length: 64 }).notNull(),
  count: int("count").default(0).notNull(),
  resetAt: timestamp("resetAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userActionUnique: uniqueIndex("daily_free_actions_user_action_unique").on(table.userId, table.actionType),
}));

export type DailyFreeAction = typeof dailyFreeActions.$inferSelect;
export type InsertDailyFreeAction = typeof dailyFreeActions.$inferInsert;

/**
 * Stores each user's preferred paid-generator length settings independently
 * from content history, free quotas, and paid credit accounting.
 */
export const generatorLengthPreferences = mysqlTable("generatorLengthPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoLength: varchar("videoLength", { length: 32 }).notNull().default("60s"),
  scriptLength: varchar("scriptLength", { length: 32 }).notNull().default("medium"),
  customVideoSeconds: int("customVideoSeconds"),
  customScriptWordTarget: int("customScriptWordTarget"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex("generator_length_preferences_user_unique").on(table.userId),
}));

export type GeneratorLengthPreference = typeof generatorLengthPreferences.$inferSelect;
export type InsertGeneratorLengthPreference = typeof generatorLengthPreferences.$inferInsert;

/**
 * Credit packages table.
 * Defines available credit purchase options.
 */
export const creditPackages = mysqlTable("creditPackages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  credits: int("credits").notNull(),
  priceInCents: int("priceInCents").notNull(), // Price in cents for Stripe
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditPackage = typeof creditPackages.$inferSelect;
export type InsertCreditPackage = typeof creditPackages.$inferInsert;

// Relations for credit system tables
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
  content: one(contentHistory, {
    fields: [creditTransactions.relatedContentId],
    references: [contentHistory.id],
  }),
}));

export const creditPackagesRelations = relations(creditPackages, ({ many }) => ({
  transactions: many(creditTransactions),
}));


/**
 * Social Media Connections table.
 * Stores OAuth tokens and connection info for social media platforms.
 */
export const socialConnections = mysqlTable("socialConnections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // instagram, twitter, linkedin, facebook, youtube, tiktok
  username: varchar("username", { length: 255 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  platformUserId: varchar("platformUserId", { length: 255 }).notNull(),
  isConnected: boolean("isConnected").default(false).notNull(), // Only true if credentials validated
  isValidated: boolean("isValidated").default(false).notNull(), // Credentials verified with platform API
  validationError: text("validationError"), // Error message if validation failed
  lastValidationAt: timestamp("lastValidationAt"), // Last time credentials were validated
  autoPost: boolean("autoPost").default(false).notNull(),
  autoReply: boolean("autoReply").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = typeof socialConnections.$inferInsert;

/**
 * Scheduled Posts table.
 * Stores posts scheduled for publishing to social media.
 */
export const scheduledPosts = mysqlTable("scheduledPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  socialConnectionId: int("socialConnectionId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  content: text("content").notNull(),
  mediaUrl: varchar("mediaUrl", { length: 2048 }),
  mediaType: mysqlEnum("mediaType", ["image", "video"]),
  mediaKey: varchar("mediaKey", { length: 255 }), // S3 storage key
  scheduledAt: timestamp("scheduledAt").notNull(),
  publishedAt: timestamp("publishedAt"),
  status: mysqlEnum("status", ["pending", "published", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  platformPostId: varchar("platformPostId", { length: 255 }), // ID from platform after publishing
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

/** One-time, encrypted OAuth state used to bind provider callbacks to the initiating account. */
export const socialOAuthStates = mysqlTable("socialOAuthStates", {
  state: varchar("state", { length: 128 }).primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  encryptedCodeVerifier: text("encryptedCodeVerifier").notNull(),
  returnPath: varchar("returnPath", { length: 512 }).notNull().default("/connected-accounts"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialOAuthState = typeof socialOAuthStates.$inferSelect;

// Relations for social media tables
export const socialConnectionsRelations = relations(socialConnections, ({ one, many }) => ({
  user: one(users, {
    fields: [socialConnections.userId],
    references: [users.id],
  }),
  scheduledPosts: many(scheduledPosts),
}));

export const scheduledPostsRelations = relations(scheduledPosts, ({ one }) => ({
  user: one(users, {
    fields: [scheduledPosts.userId],
    references: [users.id],
  }),
  socialConnection: one(socialConnections, {
    fields: [scheduledPosts.socialConnectionId],
    references: [socialConnections.id],
  }),
}));


/**
 * Engagement Events table.
 * Stores real-time comments, DMs, and engagement from social media platforms.
 */
export const engagementEvents = mysqlTable("engagementEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  socialConnectionId: int("socialConnectionId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  eventType: mysqlEnum("eventType", ["comment", "dm", "like", "share", "mention"]).notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorId: varchar("authorId", { length: 255 }).notNull(),
  content: text("content").notNull(),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).notNull(),
  sentimentScore: decimal("sentimentScore", { precision: 3, scale: 2 }).notNull().default("0.50"), // 0.00 to 1.00
  intent: mysqlEnum("intent", ["question", "praise", "support_issue", "spam", "other"]).notNull(),
  postId: varchar("postId", { length: 255 }), // Reference to original post
  isEscalated: boolean("isEscalated").default(false).notNull(),
  escalationReason: varchar("escalationReason", { length: 255 }),
  autoReplyGenerated: text("autoReplyGenerated"),
  autoReplySent: boolean("autoReplySent").default(false).notNull(),
  manualReviewNotes: text("manualReviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EngagementEvent = typeof engagementEvents.$inferSelect;
export type InsertEngagementEvent = typeof engagementEvents.$inferInsert;

/**
 * Knowledge Base table.
 * Stores user-uploaded knowledge for auto-reply generation.
 */
export const knowledgeBase = mysqlTable("knowledgeBase", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }), // FAQ, Product Info, Brand Guidelines, etc.
  tags: varchar("tags", { length: 500 }), // Comma-separated tags
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

/**
 * Auto-Reply Rules table.
 * Stores rules for intent-driven auto-replies.
 */
export const autoReplyRules = mysqlTable("autoReplyRules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  intent: mysqlEnum("intent", ["question", "praise", "support_issue", "spam", "other"]).notNull(),
  platform: varchar("platform", { length: 50 }), // null = all platforms
  replyTemplate: text("replyTemplate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoReplyRule = typeof autoReplyRules.$inferSelect;
export type InsertAutoReplyRule = typeof autoReplyRules.$inferInsert;

/**
 * Repurposed Content table.
 * Stores cross-platform repurposed content from source videos.
 */
export const repurposedContent = mysqlTable("repurposedContent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }).notNull(), // YouTube URL
  sourceType: mysqlEnum("sourceType", ["youtube_video", "article", "podcast"]).notNull(),
  transcription: text("transcription"),
  linkedinPost: text("linkedinPost"),
  facebookPost: text("facebookPost"),
  tiktokScript: text("tiktokScript"),
  instagramCaption: text("instagramCaption"),
  youtubeDescription: text("youtubeDescription"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RepurposedContent = typeof repurposedContent.$inferSelect;
export type InsertRepurposedContent = typeof repurposedContent.$inferInsert;

/**
 * Platform Analytics table.
 * Stores aggregated analytics from all platforms.
 */
export const platformAnalytics = mysqlTable("platformAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  socialConnectionId: int("socialConnectionId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  date: date("date").notNull(),
  views: int("views").default(0).notNull(),
  engagementCount: int("engagementCount").default(0).notNull(),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  autoRepliesGenerated: int("autoRepliesGenerated").default(0).notNull(),
  autoRepliesSent: int("autoRepliesSent").default(0).notNull(),
  autoReplySuccessRate: decimal("autoReplySuccessRate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformAnalytics = typeof platformAnalytics.$inferSelect;
export type InsertPlatformAnalytics = typeof platformAnalytics.$inferInsert;

/**
 * Nuelink Integration table.
 * Stores Nuelink API credentials and configuration.
 */
export const neulinkIntegration = mysqlTable("neulinkIntegration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  apiToken: text("apiToken").notNull(), // Encrypted
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NeulinkIntegration = typeof neulinkIntegration.$inferSelect;
export type InsertNeulinkIntegration = typeof neulinkIntegration.$inferInsert;

// Relations for enterprise tables
export const engagementEventsRelations = relations(engagementEvents, ({ one }) => ({
  user: one(users, {
    fields: [engagementEvents.userId],
    references: [users.id],
  }),
  socialConnection: one(socialConnections, {
    fields: [engagementEvents.socialConnectionId],
    references: [socialConnections.id],
  }),
}));

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  user: one(users, {
    fields: [knowledgeBase.userId],
    references: [users.id],
  }),
}));

export const autoReplyRulesRelations = relations(autoReplyRules, ({ one }) => ({
  user: one(users, {
    fields: [autoReplyRules.userId],
    references: [users.id],
  }),
}));

export const repurposedContentRelations = relations(repurposedContent, ({ one }) => ({
  user: one(users, {
    fields: [repurposedContent.userId],
    references: [users.id],
  }),
}));

export const platformAnalyticsRelations = relations(platformAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [platformAnalytics.userId],
    references: [users.id],
  }),
  socialConnection: one(socialConnections, {
    fields: [platformAnalytics.socialConnectionId],
    references: [socialConnections.id],
  }),
}));

export const neulinkIntegrationRelations = relations(neulinkIntegration, ({ one }) => ({
  user: one(users, {
    fields: [neulinkIntegration.userId],
    references: [users.id],
  }),
}));


/**
 * Saved trends table for users to bookmark trending topics.
 * Stores user's bookmarked trends for later reference.
 */
export const savedTrends = mysqlTable("savedTrends", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trendTitle: varchar("trendTitle", { length: 500 }).notNull(),
  trendScore: int("trendScore").notNull(),
  growthPercentage: int("growthPercentage").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  estimatedReach: varchar("estimatedReach", { length: 50 }).notNull(),
  platforms: json("platforms").notNull(), // Array of platform strings
  summary: text("summary").notNull(),
  relatedKeywords: json("relatedKeywords").notNull(), // Array of keywords
  suggestedHooks: json("suggestedHooks").notNull(), // Array of hooks
  bestPostingTime: varchar("bestPostingTime", { length: 100 }),
  externalTrendId: varchar("externalTrendId", { length: 255 }), // ID from external API
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedTrend = typeof savedTrends.$inferSelect;
export type InsertSavedTrend = typeof savedTrends.$inferInsert;

/**
 * Shared cache for public and AI-estimated trend data. This is deliberately
 * global rather than user-specific so external APIs and the model are never
 * called once per page view.
 */
export const trendCache = mysqlTable("trendCache", {
  id: int("id").autoincrement().primaryKey(),
  cacheKey: varchar("cacheKey", { length: 100 }).notNull().unique(),
  payload: json("payload").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrendCache = typeof trendCache.$inferSelect;
export type InsertTrendCache = typeof trendCache.$inferInsert;

/**
 * Content ideas table for storing AI-generated content variations.
 * Stores generated content ideas based on trends.
 */
export const contentIdeas = mysqlTable("contentIdeas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  savedTrendId: int("savedTrendId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  hook: text("hook").notNull(),
  caption: text("caption").notNull(),
  hashtags: json("hashtags").notNull(), // Array of hashtags
  contentType: varchar("contentType", { length: 50 }).notNull(), // 'reel', 'post', 'story', 'tweet', etc.
  estimatedEngagement: int("estimatedEngagement"), // Predicted engagement score
  aiGeneratedAt: timestamp("aiGeneratedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = typeof contentIdeas.$inferInsert;

// Relations for saved trends
export const savedTrendsRelations = relations(savedTrends, ({ one, many }) => ({
  user: one(users, {
    fields: [savedTrends.userId],
    references: [users.id],
  }),
  contentIdeas: many(contentIdeas),
}));

// Relations for content ideas
export const contentIdeasRelations = relations(contentIdeas, ({ one }) => ({
  user: one(users, {
    fields: [contentIdeas.userId],
    references: [users.id],
  }),
  savedTrend: one(savedTrends, {
    fields: [contentIdeas.savedTrendId],
    references: [savedTrends.id],
  }),
}));
