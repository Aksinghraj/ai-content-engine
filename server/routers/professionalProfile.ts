import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  getProfessionalProfileByUserId,
  getPublicProfessionalProfileBySlug,
  getProfessionalProfileViewSummary,
  getProfessionalProfileActivity,
  recordProfessionalProfileView,
  saveProfessionalProfile,
} from "../db";

const profileInput = z.object({
  displayName: z.string().trim().min(1).max(120),
  professionalTitle: z.string().trim().min(1).max(180),
  biography: z.string().trim().max(2_000).nullable().optional(),
  expertise: z.string().trim().max(600).nullable().optional(),
  availability: z.string().trim().max(160).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  website: z.string().trim().url().max(500).nullable().optional(),
  avatarUrl: z.string().trim().url().max(2_000).nullable().optional(),
  coverUrl: z.string().trim().url().max(2_000).nullable().optional(),
  socialLinks: z.record(z.string(), z.string().url().max(500)).default({}),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, "Use lowercase letters, numbers, periods, hyphens, or underscores only.").min(3).max(80).nullable().optional(),
  profileStatus: z.string().trim().max(100).nullable().optional(),
  collaborationOpen: z.boolean(),
  publicSlug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.").min(3).max(100).nullable().optional(),
  isPublic: z.boolean(),
  shareSocialLinks: z.boolean(),
});

const toDefaultProfile = (user: { name: string | null; email: string | null }) => ({
  displayName: user.name || "Lumae creator",
  professionalTitle: "Content Strategist & AI Workflow Builder",
  biography: "",
  expertise: "",
  availability: "Open to collaborations",
  phone: "",
  location: "",
  website: "",
  avatarUrl: "",
  coverUrl: "",
  socialLinks: {},
  username: null,
  profileStatus: "Building with Lumae",
  collaborationOpen: false,
  publicSlug: null,
  isPublic: false,
  shareSocialLinks: false,
});

export const professionalProfileRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getProfessionalProfileByUserId(ctx.user.id);
    return profile ?? toDefaultProfile(ctx.user);
  }),

  save: protectedProcedure.input(profileInput).mutation(async ({ ctx, input }) => {
    if (input.isPublic && !input.publicSlug) {
      throw new Error("Choose a public profile link before enabling sharing.");
    }
    return saveProfessionalProfile(ctx.user.id, {
      ...input,
      username: input.username?.toLowerCase() ?? null,
      publicSlug: input.publicSlug?.toLowerCase() ?? null,
    });
  }),

  publicBySlug: publicProcedure
    .input(z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100) }))
    .query(async ({ input }) => {
      const profile = await getPublicProfessionalProfileBySlug(input.slug);
      if (!profile) return null;
      const { ownerId, ...publicProfile } = profile;
      return publicProfile;
    }),

  recordPublicView: publicProcedure
    .input(z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100) }))
    .mutation(async ({ input }) => {
      const profile = await getPublicProfessionalProfileBySlug(input.slug);
      if (!profile || profile.visibility !== "public") return { recorded: false };
      await recordProfessionalProfileView(profile.ownerId);
      return { recorded: true };
    }),

  viewSummary: protectedProcedure.query(({ ctx }) => getProfessionalProfileViewSummary(ctx.user.id)),
  activity: protectedProcedure.query(({ ctx }) => getProfessionalProfileActivity(ctx.user.id)),
});
