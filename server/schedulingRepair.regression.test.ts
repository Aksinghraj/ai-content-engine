import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("scheduling and connected-account repair contracts", () => {
  it("uses persisted schedules and connected-account state instead of fixture data", () => {
    const page = read("client/src/pages/PostScheduling.tsx");
    expect(page).not.toContain("@/lib/mockData");
    expect(page).toContain("trpc.socialMedia.getScheduledPosts.useQuery()");
    expect(page).toContain("trpc.socialOAuthIntegration.getConnectedAccounts.useQuery()");
    expect(page).toContain("trpc.socialMedia.schedulePost.useMutation()");
    expect(page).toContain("trpc.socialMedia.uploadMedia.useMutation()");
  });

  it("keeps generation separate from publishing and gives it an explicit visible action", () => {
    const scheduling = read("client/src/pages/PostScheduling.tsx");
    const postPro = read("client/src/pages/CreatePostAdvanced.tsx");
    expect(scheduling).toContain("AI creates editable copy only; it never publishes or schedules automatically.");
    expect(scheduling).toContain("Generate content");
    expect(postPro).toContain("This creates editable text. It will never publish a post automatically.");
    expect(postPro).toContain("Generate content");
  });

  it("wires Create Post Pro controls to real draft, schedule, and immediate-publish mutations", () => {
    const page = read("client/src/pages/CreatePostAdvanced.tsx");
    expect(page).not.toContain("Summer Campaign Launch");
    expect(page).not.toContain("estimatedReach");
    expect(page).toContain("trpc.socialMedia.saveDraft.useMutation()");
    expect(page).toContain("trpc.socialMedia.getDrafts.useQuery()");
    expect(page).toContain("trpc.socialMedia.deleteDraft.useMutation()");
    expect(page).toContain("trpc.socialPosting.postToMultiplePlatforms.useMutation()");
    expect(page).toContain("Schedule post");
    expect(page).toContain("Publish now");
  });

  it("uses managed media and displays actual provider results in Social Publishing", () => {
    const page = read("client/src/pages/SocialMediaPublishing.tsx");
    expect(page).not.toContain("URL.createObjectURL(f)");
    expect(page).toContain("trpc.socialMedia.uploadMedia.useMutation()");
    expect(page).toContain("Provider-confirmed outcome for this publish attempt.");
    expect(page).toContain("Auto-Post is needed only for scheduled publishing.");
  });

  it("requires connection validity, token currency, Auto-Post, and managed media for a scheduled post", () => {
    const router = read("server/routers/socialMedia.ts");
    expect(router).toContain("assertSchedulingReadiness(connection, input.platform)");
    expect(router).toContain("Enable Auto-Post for your validated ${platform} account before scheduling.");
    expect(router).toContain("Use media uploaded through Lumae before publishing or scheduling.");
    expect(router).toContain("Instagram scheduling requires a Lumae-managed image or video.");
    expect(router).toContain("YouTube scheduling requires a Lumae-managed video.");
  });

  it("uses durable Heartbeat dispatch with an idempotent processing claim instead of in-process timers", () => {
    const scheduler = read("server/_core/scheduledPostScheduler.ts");
    const socialDb = read("server/db/social.ts");
    const server = read("server/_core/index.ts");
    expect(scheduler).toContain('path: JOB_PATH');
    expect(scheduler).toContain('cron: "0 * * * * *"');
    expect(scheduler).toContain("claimDueScheduledPosts");
    expect(socialDb).toContain('status: "processing"');
    expect(server).toContain('app.post("/api/scheduled/social-posts", runScheduledPosts)');
    expect(server).not.toContain("setInterval");
  });

  it("allows Instagram Business Login token refresh without incorrectly requiring a refresh token", () => {
    const flow = read("server/_core/oauthFlow.ts");
    const refreshStart = flow.indexOf("export async function refreshAccessToken");
    const instagramStart = flow.indexOf('if (platform.toLowerCase() === "instagram")', refreshStart);
    const instagramBranch = flow.slice(instagramStart, flow.indexOf("if (!connection.refreshToken)", instagramStart));
    expect(instagramBranch).toContain("refresh_access_token");
    expect(instagramBranch).not.toContain("No refresh token available");
  });

  it("does not claim an OAuth connection succeeded until provider validation succeeds", () => {
    const flow = read("server/_core/oauthFlow.ts");
    const callback = read("server/routes/oauthCallbackSecure.ts");
    const accounts = read("client/src/pages/ConnectedAccounts.tsx");
    expect(flow).toContain("isValidated: validationResult.isValid");
    expect(callback).toContain("if (!completed.isValidated)");
    expect(callback).toContain("error=validation_failed");
    expect(accounts).toContain("const guidance = platform ? PROVIDER_GUIDANCE[platform as PlatformId] : undefined;");
    expect(accounts).toContain("guidance ? `${message} ${guidance}` : message");
  });

  it("requests only the Instagram permissions supported by the current publishing workflow", () => {
    const platforms = read("server/_core/oauthPlatforms.ts");
    const instagramConfig = platforms.slice(platforms.indexOf("instagram: {"), platforms.indexOf("twitter: {"));
    expect(instagramConfig).toContain('"instagram_business_basic"');
    expect(instagramConfig).toContain('"instagram_business_content_publish"');
    expect(instagramConfig).not.toContain("instagram_business_manage_messages");
    expect(instagramConfig).not.toContain("instagram_business_manage_comments");
    expect(instagramConfig).not.toContain("instagram_business_manage_insights");
  });

  it("treats Facebook as a validated Page connection rather than a personal-profile connection", () => {
    const platforms = read("server/_core/oauthPlatforms.ts");
    const validator = read("server/_core/credentialValidation.ts");
    const publisher = read("server/_core/socialMediaPosting.ts");
    const facebookConfig = platforms.slice(platforms.indexOf("facebook: {"), platforms.indexOf("youtube: {"));
    expect(facebookConfig).toContain('"pages_show_list"');
    expect(facebookConfig).toContain('"pages_read_engagement"');
    expect(facebookConfig).toContain('"pages_manage_posts"');
    expect(validator).toContain('https://graph.facebook.com/v26.0/me/accounts');
    expect(validator).toContain('page.tasks.includes("CREATE_CONTENT")');
    expect(validator).toContain("publishingAccessToken: page.access_token");
    expect(publisher).toContain("/${connection.platformUserId}/photos");
  });

  it("requests durable offline access when a user connects YouTube", () => {
    const flow = read("server/_core/oauthFlow.ts");
    expect(flow).toContain('if (normalizedPlatform === "youtube")');
    expect(flow).toContain('params.append("access_type", "offline")');
    expect(flow).toContain('params.append("include_granted_scopes", "true")');
    expect(flow).toContain('params.append("prompt", "consent")');
  });

  it("keeps X publishing unavailable until the owner explicitly enables an approved API budget", () => {
    const publisher = read("server/_core/socialMediaPosting.ts");
    const platforms = read("server/_core/oauthPlatforms.ts");
    const flow = read("server/_core/oauthFlow.ts");
    expect(publisher).toContain("isXPublishingEnabled()");
    expect(publisher).toContain("X publishing is unavailable until the owner enables an approved X API budget.");
    expect(platforms).toContain('tokenEndpoint: "https://api.x.com/2/oauth2/token"');
    expect(platforms).toContain('userInfoEndpoint: "https://api.x.com/2/users/me"');
    expect(flow).toContain('if (normalizedPlatform === "twitter")');
    expect(flow).toContain("tokenHeaders.Authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString(\"base64\")}`");
    expect(flow).toContain("refreshHeaders.Authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString(\"base64\")}`");
  });

  it("requires a connected, validated, unexpired user-owned account before immediate publishing", () => {
    const router = read("server/routers/socialPosting.ts");
    expect(router).toContain("async function assertPublishingReadiness");
    expect(router).toContain("if (!connection?.isConnected)");
    expect(router).toContain("if (!connection.isValidated)");
    expect(router).toContain("connection.tokenExpiresAt");
    expect(router).toContain("await assertPublishingReadiness(ctx.user.id, input.platform)");
    expect(router).toContain("Promise.all(input.platforms.map((platform) => assertPublishingReadiness(ctx.user.id, platform)))");
  });
});
