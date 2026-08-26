import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");
const approvedSymbol = "/manus-storage/lumae-symbol-approved_9f697591.jpg";

describe("approved Lumae symbol placements", () => {
  it("uses the approved symbol asset in the sidebar and public footer only", () => {
    const sidebar = read("client/src/components/DashboardLayout.tsx");
    const footer = read("client/src/components/Footer.tsx");

    expect(sidebar).toContain(`src="${approvedSymbol}"`);
    expect(footer).toContain(`src="${approvedSymbol}"`);
    expect(sidebar).toContain('alt="Lumae symbol"');
    expect(footer).toContain('alt="Lumae symbol"');
  });
});
