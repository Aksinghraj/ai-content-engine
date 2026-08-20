import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getUnifiedTrends } from "../_core/trendService";

export const trendingRouter = router({
  // Unified cache: Live YouTube topics plus explicitly AI-estimated topics
  // for platforms that do not expose a public trends API.
  getTrendingTopics: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const payload = await getUnifiedTrends(input.limit);
      return { success: true, data: payload.topics, count: payload.topics.length, generatedAt: payload.generatedAt };
    }),

  refreshUnifiedTrends: protectedProcedure.mutation(async () => {
    const { refreshUnifiedTrends } = await import("../_core/trendService");
    return refreshUnifiedTrends(true);
  }),
});
