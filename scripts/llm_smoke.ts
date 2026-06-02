import "dotenv/config";
import fs from "fs/promises";
import { generateContentPackage } from "../server/_core/contentGenerator";

(async () => {
  try {
    console.log("Running LLM smoke test: generateContentPackage...");

    const input = {
      niche: "fitness",
      targetAudience: "young adults",
      platform: "tiktok",
      goal: "engagement",
      contentStyle: "viral",
      language: "en",
      videoLength: "30s",
      scriptLength: "short",
      trendingTopics: ["home workouts", "quick routines"],
    };

    const result = await generateContentPackage(input as any);
    await fs.mkdir("samples", { recursive: true });
    await fs.writeFile("samples/llm_smoke.json", JSON.stringify(result, null, 2), "utf8");
    console.log("LLM smoke test completed. Output saved to samples/llm_smoke.json");
  } catch (err) {
    console.error("LLM smoke test failed:", err);
    process.exit(1);
  }
})();
