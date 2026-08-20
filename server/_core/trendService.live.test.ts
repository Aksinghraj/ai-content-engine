import { describe, expect, it } from "vitest";
import { refreshUnifiedTrends, recommendationForCategory } from "./trendService";

describe("unified trend service", () => {
  it("returns cached Live YouTube topics alongside explicitly AI-estimated unsupported-platform topics", async () => {
    const payload = await refreshUnifiedTrends(true);

    expect(payload.topics.length).toBeGreaterThan(0);
    expect(payload.topics.some((topic) => topic.source === "youtube" && topic.dataKind === "live")).toBe(true);
    expect(payload.topics.some((topic) => topic.source !== "youtube" && topic.dataKind === "ai_estimated")).toBe(true);
    expect(payload.topics.every((topic) => topic.title.length > 0 && topic.suggestedStyle.length > 0 && topic.suggestedGoal.length > 0)).toBe(true);
  }, 30_000);

  it("maps a comedic theme to a user-overridable Humorous / Engagement suggestion", () => {
    expect(recommendationForCategory("comedy")).toEqual({ suggestedStyle: "Humorous", suggestedGoal: "Engagement" });
  });
});
