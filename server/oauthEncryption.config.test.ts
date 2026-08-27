import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./_core/encryption";
import { ENV } from "./_core/env";

describe("OAuth-state encryption configuration", () => {
  it("uses the deployed DATA_ENCRYPTION_KEY to protect and recover a temporary OAuth value", () => {
    expect(ENV.dataEncryptionKey).toBeDefined();
    expect(ENV.dataEncryptionKey.length).toBeGreaterThanOrEqual(32);

    const protectedValue = encrypt("oauth-state-validation-probe");
    expect(protectedValue).not.toContain("oauth-state-validation-probe");
    expect(decrypt(protectedValue)).toBe("oauth-state-validation-probe");
  });
});
