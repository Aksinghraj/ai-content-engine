import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("consent-first Business messaging foundation", () => {
  it("stores contact consent separately per channel and records consent events", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db/businessMessaging.ts");

    expect(schema).toContain('export const businessContacts');
    expect(schema).toContain('emailConsent: boolean("emailConsent").default(false).notNull()');
    expect(schema).toContain('whatsappConsent: boolean("whatsappConsent").default(false).notNull()');
    expect(schema).toContain('export const businessConsentEvents');
    expect(db).toContain('channel: "email" as const');
    expect(db).toContain('channel: "whatsapp" as const');
    expect(db).toContain('action: "withdrawn"');
  });

  it("rejects contacts without explicit channel consent and has no outbound send operation", () => {
    const router = read("server/routers/businessMessaging.ts");

    expect(router).toContain("Record explicit email consent before adding an email contact.");
    expect(router).toContain("Record explicit WhatsApp consent before adding a WhatsApp contact.");
    expect(router).toContain("outboundMessagingEnabled: false");
    expect(router).not.toContain("sendEmail(");
    expect(router).not.toContain("messages.send");
  });

  it("keeps WhatsApp linking limited to official configuration state until Meta credentials exist", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers/businessMessaging.ts");
    const page = read("client/src/pages/BusinessAutomation.tsx");

    expect(schema).toContain('export const whatsappBusinessConnections');
    expect(schema).toContain('encryptedBusinessToken: text("encryptedBusinessToken")');
    expect(router).toContain("META_WHATSAPP_APP_ID");
    expect(router).toContain("META_WHATSAPP_CONFIG_ID");
    expect(router).toContain("META_WHATSAPP_APP_SECRET");
    expect(router).toContain("Complete the official Meta app setup first.");
    expect(page).toContain("official Embedded Signup flow");
    expect(page).toContain("No account or token is collected from this page.");
    expect(page).toContain("Outbound messaging is off.");
  });
});
