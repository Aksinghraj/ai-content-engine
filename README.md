# ai-content-engine

Lightweight AI Content Engine for generating social media content packages using LLMs.

Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Create an `.env` (see `.env.example`) and set required secrets.

3. Run development server:

```bash
pnpm dev
```

Notes
- Backend LLM integration expects `FORGE_API_KEY` (and optional `FORGE_API_URL`) in env.
- Database migrations use `drizzle-kit` (see `package.json` `db:push` script).

Contributing
- Open PRs against `main`. This repo contains both the frontend (`client/`) and backend (`server/`).
