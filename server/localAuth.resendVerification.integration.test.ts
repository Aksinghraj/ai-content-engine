import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createLocalAccount, getUserByNormalizedEmail, hashPassword } from "./db/localAuth";
import type { TrpcContext } from "./_core/context";

const testRecipient = process.env.LUMAE_CONTROLLED_RESEND_RECIPIENT;
const testApproved = process.env.LUMAE_CONTROLLED_RESEND_APPROVED === "true";
const controlledResend = testRecipient && testApproved ? it : it.skip;

function contextFor(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("local verification resend delivery", () => {
  controlledResend("reports accepted only after Resend accepts one verification message, then erases the temporary account", async () => {
    const email = testRecipient!;
    let cleanupUser: TrpcContext["user"] = null;

    try {
      const created = await createLocalAccount({
        name: "Lumae Resend Check",
        email,
        passwordHash: await hashPassword("Lumae!TemporaryTest9"),
      });
      expect(created).not.toBeNull();
      cleanupUser = await getUserByNormalizedEmail(email);

      const result = await appRouter.createCaller(contextFor(null)).localAuth.resendVerification({ email });
      expect(result).toMatchObject({ accepted: true, emailDeliveryAvailable: true, emailDeliveryConfigured: true });
    } finally {
      if (cleanupUser) await appRouter.createCaller(contextFor(cleanupUser)).auth.account.deleteAccount();
    }

    expect(await getUserByNormalizedEmail(email)).toBeNull();
  }, 20_000);
});
