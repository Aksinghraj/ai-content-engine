import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./_core/encryption";

describe("OAuth-state encryption configuration", () => {
  it("uses the deployed DATA_ENCRYPTION_KEY to protect and recover a temporary OAuth value", () => {
    expect(process.env.DATA_ENCRYPTION_KEY).toBeDefined();
    expect(process.env.DATA_ENCRYPTION_KEY?.length).toBeGreaterThanOrEqual(32);

    const protectedValue = encrypt("oauth-state-validation-probe");
    expect(protectedValue).not.toContain("oauth-state-validation-probe");
    expect(decrypt(protectedValue)).toBe("oauth-state-validation-probe");
  });
});
