# flexed — Key Decisions

## Auth: proxy.ts (not middleware)
- Auth check lives in `next/config.matcher` (`proxy.ts` `config.matcher`), not Next.js middleware file.
- Reason: easier cookie access on server components; avoids edge runtime limitations.
- Pattern: `matchesRoute(pathname, routes)` checks exact match or prefix (`/dashboard/:path*`).
- Unauth → `/login?redirectTo=<encoded path>`; callback at `/auth/callback` exchanges code for session.

## Supabase: createServerClient cookie approach
- `lib/server.ts` uses `await cookies()` from `next/headers` to get cookie store.
- `getAll()` returns `request.cookies.getAll()`; `setAll()` modifies `cookieStore.set()` then re-creates `NextResponse`.
- `lib/client.ts` uses `createBrowserClient` for browser/SSR.
- Decision: keep both; server components use `createClient()`, client components import `supabase` from `lib/client`.

## Tailwind 4 + Turbopack
- `next.config.ts` adds `*.css` rule: `loaders: ["@tailwindcss/turbopack"]`.
- Decision: keep Tailwind 4 config minimal — only what Turbopack needs. No custom `safelist` yet.

## Groq review generation vs custom model
- `api/generate-review/route.ts` uses `openai/gpt-oss-120b` via Groq.
- Reason: fastest path to working AI review drafts; avoids hosting own model.
- Ceiling: if rate-limited or cost-prohibitive, swap to OpenAI directly or add fallback.

## shadcn/ui over custom components
- All UI from shadcn/ui registry; only `cn` utility is project-owned.
- Decision: add new components from shadcn scaffold, never build from scratch unless >50 lines.

## No new dependencies beyond listed
- ponytail rule: every new dep must be justified against existing (`cn`, `tw-animate-css`, `sonner`, `lucide-react`, `zustand`, `class-variance-authority`).
- Decision: any new dep requires explicit approval — record in CHANGELOG.