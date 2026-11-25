# flexed — Architecture

## App routes
- `app/layout.tsx` — Root layout, Geist font, ThemeProvider, TooltipProvider, Toaster
- `app/page.tsx` — `[code]` landing (placeholder)
- `app/auth/callback/route.ts` — Supabase OAuth exchange → redirect to `/workspace`
- `app/login/page.tsx` — Login form (email/password + Google OAuth)
- `app/signup/page.tsx` — Signup form
- `app/account/page.tsx` — Account section (WIP: commented-out `<AccountsPage />`)
- `app/analytics/page.tsx` — Analytics placeholder (`<div>AnalyticsPage</div>`)
- `app/workspace/page.tsx` — Workspace dashboard
- `app/workspace/create/page.tsx` — Create new workspace
- `app/workspace/touchpoint/[code]/page.tsx` — Touchpoint detail
- `app/api/generate-review/route.ts` — POST: generate Google review draft via Groq

## Auth flow
1. `/login` / `/signup` → email/password or Google OAuth
2. Google OAuth → `/auth/callback` → Supabase `exchangeCodeForSession` → redirect to `/workspace`
3. `proxy.ts` middleware — protects `/dashboard /workspace /analytics /account`, redirects unauth to `/login?redirectTo=<path>`
4. `stores/use-touchpoint-store.ts` — Zustand store, initial state: `touchpoints: [], userId: null, loaded: false`

## API routes
- `POST /api/generate-review` — body: `{ business: { name, description?, metadata: { automation: { tone, language, instructions? } } } }` → Groq `openai/gpt-oss-120b` → returns review draft text (max 1200 tokens)
- Body size limited to 6000 bytes (content-length + text-encoder check)
- GROQ_API_KEY required; if missing → 503

## Styling
- Tailwind 4 with Turbopack CSS loader (`next.config.ts` rules for `*.css`)
- shadcn/ui components: `button`, `card`, `input`, `field`, `tooltip`, `sonner`, `sidebar`, `tabs`, `select`, `switch`, `slider`, `textarea`, `skeleton`, `sonner`, `badge`, `breadcrumb`, `collapsible`, `dialog`, `dropdown-menu`, `empty`, `field`, `label`, `separator`, `sheet`, `skeleton`, `slider`, `sonner`, `switch`, `tabs`, `textarea`, `toast`, `tooltip`
- `cn` utility for className merging

## Key files
- `proxy.ts` — auth middleware, cookie preservation on redirect
- `lib/server.ts` — Supabase server client with cookie persistence
- `lib/client.ts` — Supabase browser client
- `lib/review.ts` — `getGoogleReviewUrl` helper (maps Maps URLs → review URLs)
- `components/shared/app-shell.tsx` — shared layout wrapper
- `components/shared/theme-toggle.tsx` — light/dark toggle