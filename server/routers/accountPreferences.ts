import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as preferences from "../db/userPreferences";

const languageCode = z.enum(["en", "hi", "hinglish", "bho", "bn", "gu", "kn", "ml", "mr", "pa", "ta", "te"]);

export const accountPreferencesRouter = router({
  getLanguage: protectedProcedure.query(({ ctx }) => preferences.getAccountLanguage(ctx.user.id)),
  setLanguage: protectedProcedure.input(z.object({ language: languageCode })).mutation(async ({ ctx, input }) => ({ language: await preferences.saveAccountLanguage(ctx.user.id, input.language) })),
});
