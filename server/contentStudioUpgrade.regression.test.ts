import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("Content Studio upgrade contracts", () => {
  it("keeps Gemini 2.5 Flash as the centralized default model", () => {
    const llm = read("server/_core/llm.ts");
    expect(llm).toContain('model: model ?? "gemini-2.5-flash"');
    expect(llm).toContain("payload.max_tokens = 32768");
  });

  it("requires professional script structure and grounded reference context", () => {
    const generator = read("server/_core/contentGenerator.ts");
    expect(generator).toContain("Hook, Body, and CTA");
    expect(generator).toContain("Target the requested script length within approximately 10%");
    expect(generator).toContain("REFERENCE MATERIAL:");
    expect(generator).toContain("referenceImageUrl");
  });

  it("keeps reference inputs bounded and image-only for multimodal context", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("referenceDocumentText: z.string().max(20_000)");
    expect(router).toContain("Reference image must be an image data URL");
  });

  it("uses real client-side PDF and DOCX exports with the approved watermark", () => {
    const pdf = read("client/src/lib/pdfExport.ts");
    const docx = read("client/src/lib/docxExport.ts");
    const generator = read("client/src/pages/Generator.tsx");
    expect(pdf).toContain("Lumae AI · lumae.co.in");
    expect(docx).toContain("Lumae AI · lumae.co.in");
    expect(generator).toContain('exportContent("docx")');
    expect(generator).toContain("pdfjsLib.getDocument");
  });
});
