import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createLocalAccount, getUserByNormalizedEmail, hashPassword, verifyLocalAccountEmail } from "./db/localAuth";
import type { TrpcContext } from "./_core/context";

const testRecipient = process.env.LUMAE_CONTROLLED_RESET_RECIPIENT;
const testApproved = process.env.LUMAE_CONTROLLED_RESET_APPROVED === "true";
const controlledReset = testRecipient && testApproved ? it : it.skip;

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

describe("local password-reset delivery", () => {
  controlledReset("sends one reset request only after Resend acceptance, applies cooldown, then erases its temporary account", async () => {
    const email = testRecipient!;
    const password = "Lumae!TemporaryReset9";
    const account = await createLocalAccount({
      name: "Lumae Reset Delivery Test",
      email,
      passwordHash: await hashPassword(password),
    });
    expect(account).not.toBeNull();

    const verifiedUser = await verifyLocalAccountEmail(account!.verificationToken);
    expect(verifiedUser?.emailVerified).toBe(true);
    const caller = appRouter.createCaller(contextFor(null));

    try {
      await expect(caller.localAuth.requestPasswordReset({ email })).resolves.toMatchObject({ status: "sent" });
      await expect(caller.localAuth.requestPasswordReset({ email })).resolves.toMatchObject({ status: "throttled" });
    } finally {
      if (verifiedUser) {
        await appRouter.createCaller(contextFor(verifiedUser)).auth.account.deleteAccount();
      }
    }

    expect(await getUserByNormalizedEmail(email)).toBeNull();
  }, 20_000);
});
