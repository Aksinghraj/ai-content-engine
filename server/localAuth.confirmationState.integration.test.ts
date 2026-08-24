import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createLocalAccount, getLocalAccountByEmail, getUserByNormalizedEmail, hashPassword, verifyLocalAccountEmail } from "./db/localAuth";
import type { TrpcContext } from "./_core/context";

const testApproved = process.env.LUMAE_CONFIRMATION_STATE_TEST_APPROVED === "true";
const controlledConfirmationState = testApproved ? it : it.skip;

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

describe("local email-confirmation state", () => {
  controlledConfirmationState("accepts one valid confirmation token, rejects invalid or replayed tokens, and erases its temporary account", async () => {
    const email = `confirmation-state-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@lumae.test`;
    const account = await createLocalAccount({
      name: "Lumae Confirmation Test",
      email,
      passwordHash: await hashPassword("Lumae!TemporaryConfirm9"),
    });
    expect(account).not.toBeNull();

    let cleanupUser: TrpcContext["user"] = null;
    try {
      await expect(verifyLocalAccountEmail("invalid-confirmation-token")).resolves.toBeNull();

      const verifiedUser = await verifyLocalAccountEmail(account!.verificationToken);
      expect(verifiedUser?.emailVerified).toBe(true);
      cleanupUser = verifiedUser ?? null;

      const verifiedAccount = await getLocalAccountByEmail(email);
      expect(verifiedAccount?.user.emailVerified).toBe(true);
      expect(verifiedAccount?.credential.verifiedAt).toBeTruthy();
      expect(verifiedAccount?.credential.verificationTokenHash).toBeNull();
      await expect(verifyLocalAccountEmail(account!.verificationToken)).resolves.toBeNull();
    } finally {
      if (cleanupUser) {
        await appRouter.createCaller(contextFor(cleanupUser)).auth.account.deleteAccount();
      }
    }

    expect(await getUserByNormalizedEmail(email)).toBeNull();
  }, 20_000);
});
