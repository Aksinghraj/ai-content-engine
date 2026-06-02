# content_ai — Project Analysis

## Overview
- Purpose: `ai-content-engine` is a content-generation platform focused on producing social media content packages (scripts, hooks, captions, hashtags, repurposing) using LLMs and automation.
- Stack: TypeScript, Vite + React frontend, Node backend, `drizzle-orm` for database migrations, and LLM integration via a Forge/Manus API.

## High-level Structure
- Client: [client/index.html](client/index.html) and React app in [src/](src) (entry: [src/main.tsx](src/main.tsx), app shell: [src/App.tsx](src/App.tsx)).
- Server: core runtime and routers in [server/](server). Key engine code lives in [server/_core/](server/_core/).
- Database: schema and migrations under [drizzle/](drizzle) and `drizzle-kit` integration in `package.json` scripts.
- Docs & scripts: top-level markdowns and operational guides (e.g., `DEPLOYMENT_GUIDE.md`, `OAUTH_SETUP_GUIDE.md`).

## Key Files Observed
- Project metadata and scripts: [package.json](package.json)
- Core content generation: [server/_core/contentGenerator.ts](server/_core/contentGenerator.ts)
- LLM invocation + normalization: [server/_core/llm.ts](server/_core/llm.ts)
- DB schema: [drizzle/schema.ts](drizzle/schema.ts)
- Frontend entry & UI: [src/App.tsx](src/App.tsx) and [src/main.tsx](src/main.tsx)

## Notable Details
- Scripts: `dev`, `build`, `start`, `check`, `test`, and `db:push` (runs `drizzle-kit`). The project is designed to run locally with `pnpm` and `tsx` during development.
- Dependencies indicate a full-featured UI (Radix UI components, Tailwind, React 19), `trpc` for client-server RPC, and common AI/dev tooling (node-fetch, streamdown, dotenv).
- Database: `drizzle-orm` with MySQL (`mysql2`) integration. Migrations and snapshots are present under `drizzle/migrations` and `drizzle/meta`.
- LLM integration: `server/_core/llm.ts` posts to a Forge/Manus endpoint (defaulting to https://forge.manus.im/v1/chat/completions) and uses environment key `ENV.forgeApiKey`. The `invokeLLM` wrapper normalizes messages and supports JSON schema response formatting.
- Content model: `generateContentPackage` (in `contentGenerator.ts`) builds a rich JSON schema for a "," enforcing strict structure (viral ideas, hooks, scripts, carousel slides, repurposing, optimization tips). It normalizes and validates LLM output before returning.
- Internationalization: the content generator supports multiple Indian languages (Hindi, Hinglish, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi) via language maps and instructions.
- Tests: `vitest` tests exist under `server/` for multiple features (content generation, webhooks, social media posting), indicating CI-focused code quality checks.

## Risks & Configuration Notes
- Secrets: `ENV.forgeApiKey` (LLM access) and other env vars are required; ensure `.env` or environment provider (Vaul/secret manager) is configured.
- API endpoint: code uses `ENV.forgeApiUrl` override when present; otherwise uses Manus/Forge default.
- Large token budgets: `invokeLLM` sets very large `max_tokens` and a `thinking` budget—verify provider limits to avoid rejected requests.

## Quick Recommendations / Next Steps
1. Add or confirm a top-level `README.md` with quick start commands: `pnpm install`, `pnpm dev` (or `pnpm run dev`).
2. Create an `.env.example` with required vars (e.g., `FORGE_API_KEY`, DB connection vars) and document `drizzle` migration steps.
3. Verify LLM provider quotas and add safe guards (timeouts, token limits) in `invokeLLM` if needed.
4. Add CI scripts to run `pnpm test` and `pnpm check` on PRs.

## Questions for you
- Do you want a more detailed file-by-file inventory (sizes, LOC, TODOs)?
- Should I open PR-style changes to add `README.md` and `.env.example` now?

---
Generated on 2026-06-02 by analysis script.
