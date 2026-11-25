# flexed

Next.js 16 + Tailwind 4 + Supabase auth. Model: sterling. Ponytail mode: full.

## Commands
- `pnpm dev` — dev server (turbopack)
- `pnpm build` — static build
- `pnpm lint` — eslint

## Critical constraints
- `proxy.ts` — protected routes `/dashboard /workspace /analytics /account`, unauth → `/login?redirectTo=<path>`, Google OAuth callback at `/auth/callback`
- `api/generate-review/route.ts` — MAX_BODY_BYTES = 6000, Groq `openai/gpt-oss-120b`, review drafts only, no fabrication
- `GROQ_API_KEY` env var required; missing → 503
- Supabase client via `lib/client.ts` (browser) and `lib/server.ts` (server components)
- `stores/use-touchpoint-store.ts` — Zustand store for touchpoints

## Never add new dependencies
ponytail ceiling — use existing: `cn`, `tw-animate-css`, `sonner`, `lucide-react`, `zustand`, `class-variance-authority`.

## /graphify trigger
Any input → knowledge graph via installed skill.