import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as preferences from "../db/userPreferences";

const languageCode = z.enum(["en", "hi", "hinglish", "bho", "as", "bn", "brx", "doi", "gu", "kn", "ks", "kok", "mai", "ml", "mni", "mr", "ne", "or", "pa", "sa", "sat", "sd", "ta", "te", "ur"]);

export const accountPreferencesRouter = router({
  getLanguage: protectedProcedure.query(({ ctx }) => preferences.getAccountLanguage(ctx.user.id)),
  setLanguage: protectedProcedure.input(z.object({ language: languageCode })).mutation(async ({ ctx, input }) => ({ language: await preferences.saveAccountLanguage(ctx.user.id, input.language) })),
});
