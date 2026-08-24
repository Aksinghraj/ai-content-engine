import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getLocalAccountByEmail, getUserByNormalizedEmail } from "./db/localAuth";
import type { TrpcContext } from "./_core/context";

const testRecipient = process.env.LUMAE_CONTROLLED_REGISTRATION_RECIPIENT;
const testApproved = process.env.LUMAE_CONTROLLED_REGISTRATION_APPROVED === "true";
const controlledRegistration = testRecipient && testApproved ? it : it.skip;

function contextFor(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: () => undefined,
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
}

describe("local registration delivery", () => {
  controlledRegistration("creates an unverified account only after Resend accepts the verification message, then erases it", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = testRecipient === "delivered@resend.dev"
      ? testRecipient
      : testRecipient!.replace("@", `+lumae-registration-${suffix}@`);
    const password = "Lumae!TemporaryTest9";
    const caller = appRouter.createCaller(contextFor(null));
    let cleanupUser: TrpcContext["user"] = null;

    try {
      const registration = await caller.localAuth.register({
        name: "Lumae Delivery Test",
        email,
        password,
      });

      expect(registration).toMatchObject({
        verificationRequired: true,
        emailDeliveryConfigured: true,
        emailDeliveryAvailable: true,
      });

      const account = await getLocalAccountByEmail(email);
      expect(account?.user.emailVerified).toBe(false);
      expect(account?.credential.verifiedAt).toBeNull();
      cleanupUser = account?.user ?? null;

      await expect(caller.localAuth.login({ email, password, rememberMe: false })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    } finally {
      if (cleanupUser) {
        await appRouter.createCaller(contextFor(cleanupUser)).auth.account.deleteAccount();
      }
    }

    expect(await getUserByNormalizedEmail(email)).toBeNull();
  }, 20_000);
});
