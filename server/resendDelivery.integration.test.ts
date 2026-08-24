import { describe, expect, it } from "vitest";

const sender = "Lumae AI <noreply@mail.lumae.co.in>";
const controlledRecipient = process.env.RESEND_CONTROLLED_TEST_RECIPIENT;
const controlledDeliveryApproved = process.env.RESEND_CONTROLLED_TEST_APPROVED === "true";
const controlledDelivery = controlledRecipient && controlledDeliveryApproved ? it : it.skip;

describe("Resend transactional delivery configuration", () => {
  it("keeps the Resend key and verified sender server-side configured", () => {
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
    const normalizedSender = process.env.RESEND_FROM_EMAIL
      ?.replace(/\\u003c/g, "<")
      .replace(/\\u003e/g, ">");

    expect(normalizedSender).toBe(sender);
  });

  controlledDelivery("confirms provider acceptance with one owner-approved delivery", async () => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [controlledRecipient],
        subject: "Lumae email delivery check",
        html: "<p>This owner-approved message confirms Lumae email delivery. No action is required.</p>",
      }),
    });

    expect(response.ok).toBe(true);
    const body = (await response.json()) as { id?: string };
    expect(body.id).toEqual(expect.any(String));
  });
});
