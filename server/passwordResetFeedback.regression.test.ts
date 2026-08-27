import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("password reset and verification resend delivery feedback", () => {
  it("reports actual verification resend acceptance instead of configuration alone", () => {
    const router = read("server/routers/localAuth.ts");

    expect(router).toContain("let emailDeliveryAvailable = false");
    expect(router).toContain("emailDeliveryAvailable = await sendLocalVerificationEmail");
    expect(router).toContain("accepted: emailDeliveryAvailable");
  });

  it("keeps password-reset outcomes visible on the page without disclosing account type", () => {
    const page = read("client/src/pages/ForgotPassword.tsx");

    expect(page).toContain("const [feedback, setFeedback]");
    expect(page).not.toContain("continue with that method");
    expect(page).toContain("a reset email has been accepted for delivery");
    expect(page).toContain('role={feedback.tone === "error" ? "alert" : "status"}');
  });
});
