import { describe, expect, it } from "vitest";
import { normalizeTransactionalSender } from "./_core/emailService";

describe("transactional sender normalization", () => {
  it("converts escaped angle brackets to the sender format Resend accepts", () => {
    expect(normalizeTransactionalSender("Lumae AI \\u003cnoreply@mail.lumae.co.in\\u003e"))
      .toBe("Lumae AI <noreply@mail.lumae.co.in>");
  });

  it("preserves an already valid sender and treats missing configuration as empty", () => {
    expect(normalizeTransactionalSender("Lumae AI <noreply@mail.lumae.co.in>"))
      .toBe("Lumae AI <noreply@mail.lumae.co.in>");
    expect(normalizeTransactionalSender(undefined)).toBe("");
  });
});
