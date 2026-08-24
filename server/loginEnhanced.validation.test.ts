import { describe, expect, it } from "vitest";
import { passwordStrength, registrationPasswordError, validEmail } from "../client/src/pages/LoginEnhanced";

describe("LoginEnhanced mobile submit validation", () => {
  it("does not describe a password without a symbol as strong", () => {
    const passwordWithoutSymbol = "Aa1password12";

    expect(passwordStrength(passwordWithoutSymbol)).toMatchObject({ score: 4, label: "Almost there" });
    expect(registrationPasswordError(passwordWithoutSymbol)).toBe("Add one symbol, such as !, @, #, or $ to your password.");
  });

  it("accepts only passwords that meet the visible registration requirement", () => {
    expect(registrationPasswordError("Aa1password12!")).toBeNull();
    expect(registrationPasswordError("short1A!")).toBe("Use at least 12 characters in your password.");
  });

  it("requires an email-shaped address before initiating local authentication", () => {
    expect(validEmail("creator@example.com")).toBe(true);
    expect(validEmail("not-an-email")).toBe(false);
  });
});
