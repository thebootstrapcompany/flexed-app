# flexed — Changelog

## v1.0.0 — 2026-10-26
- Init: Next.js 16 + Tailwind 4 + Supabase auth skeleton
- Added `proxy.ts` auth middleware (protected routes, Google OAuth callback)
- Added `lib/server.ts` and `lib/client.ts` Supabase clients
- Added shadcn/ui component library (button, card, input, field, etc.)
- Added `app/layout.tsx` with Geist font, ThemeProvider, TooltipProvider, Toaster
- Added `app/login/page.tsx` and `app/signup/page.tsx` auth forms
- Added `app/workspace/` pages (dashboard, create, touchpoint detail)
- Added `api/generate-review/route.ts` — Groq `openai/gpt-oss-120b` review generation
- Added `lib/review.ts` — Google review URL builder
- Added `stores/use-touchpoint-store.ts` Zustand store
- Added `components/shared/app-shell.tsx`, `theme-toggle.tsx`, navigation
- Added `.env.local` / `.env.example`
- Added `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `docs/DECISIONS.md`
- Git init, first commit c6590a6 "Initialize Project"