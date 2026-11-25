# Project Overview: flexed

## Context
This document provides a comprehensive overview of the `flexed` project — a Next.js 16 application built with Tailwind 4, Supabase auth, and Groq for AI-generated review drafting. It serves as a reference for developers joining the project, documenting architecture, flows, patterns, and key components for maintainability and knowledge transfer.

## High-level purpose
`flexed` is a business management platform for creating, managing, and sharing QR-code-based touchpoints with customers. Users can generate dynamic touchpoints (e.g., contact cards, product flyers) via QR codes, store business profiles, track reviews via Google Maps integration, and generate review drafts using Groq-powered AI.

## Architecture overview

### Frontend framework
- **Next.js 16** with App Router, Turbopack for development, and static optimization for production.
- **React 19** with client and server components.
- **TypeScript** throughout for type safety.
- **Tailwind CSS 4** (via Turbopack) for styling; fully integrated with shadcn/ui components.
- **ponytail mode** enabled (full intensity) — enforces maximum efficiency, reuse, and minimal code.

### Auth & security
- **Supabase** as auth provider, including managed users, OAuth (Google), and session handling.
- **`proxy.ts`** middleware protects `/workspace`, `/analytics`, `/account`, and `/dashboard` routes; unauthenticated requests redirect to `/login?redirectTo=...` preserving intended path.
- **`lib/server.ts`** and **`lib/client.ts`** provide authenticated server and browser Supabase clients with cookie persistence for SSO.

### State management
- **Zustand** for UI-level stores (`use-business-store.ts`, `use-touchpoint-store.ts`).
- Business and touchpoint stores synced with Supabase real-time queries where appropriate.

### Data layer (Supabase)
The project uses a single Supabase Postgres instance with the following key tables:

- **`users`** — extends auth users with optional subscription linkage and metadata.
- **`businesses`** — user-owned business profiles with username, name, email, phone, links (maps/reviews), and a JSON metadata field.
- **`variant`** — defines touchpoint variant types (flyer, card, display, standee) and metadata for design properties (dimensions, materials, images, availability).
- **`inventory`** — maps unique short codes (`5-char`) to variants; codes are seeded, initially inactive, and become claimed when activated.
- **`touchpoints`** — links a scanned `inventory.code` to a `business_id`, stores display name (user-entered), status (active/inactive), and metadata (name only per current flow). Includes audit columns (`created_at`, `updated_at`).

Tables have RLS policies that enforce ownership: users can only interact with resources belonging to their own businesses.

### API layer
- **`api/generate-review/route.ts`** — accepts a POST with business name/description and optional automation preferences; validates Groq API key (6000-byte limit) and returns a review draft generated via the Groq `openai/gpt-oss-120b` model.

### Component architecture

#### Core layout
- **`app/layout.tsx`** — root HTML with font imports (Geist, Geist_Mono, Inter), theme provider, and global Toaster.
- **`components/shared/app-shell.tsx`** — wraps the main app content with a top header, main area with max-width, and mobile navigation.
- **`components/shared/app-header.tsx`**, **`components/shared/mobile-nav.tsx`**, **`components/shared/theme-toggle.tsx`** — UI shared across pages.

#### Workspace
- **`app/workspace/page.tsx`** — dashboard that currently shows only `BusinessCards` (list of businesses). The `Touchpoints` list is present but commented out.
- **`components/workspace/business-cards.tsx`** — CRUD for businesses (create/edit/view). Uses Supabase insert/select for business creation, validates username uniqueness, and includes Google Maps integration for reviews.

#### Touchpoints
- **`components/workspace/touchpoints.tsx`** — list of touchpoints for a given business; uses `useTouchpointStore` to fetch and display touchpoint cards.
- **`components/workspace/studio/touchpoint-drawer.tsx`** — drawer modal for adding new touchpoints; currently renders `ScanPage` (QR scanner) but not the form the user described.
- **`components/workspace/scanner.tsx`** — QR scanner that (as of current state) supports scanning, verification via `check_touchpoint_code` RPC, and a form with business name / URL / email / phone to “activate” a touchpoint via a nonexistent `activate_touchpoint` RPC.
- **`app/workspace/touchpoint/[code]/page.tsx`** — displays details for a single touchpoint (not fully explored here).

#### UI components
All UI elements are built from shadcn/ui primitives (Button, Input, Card, etc.) and styled with Tailwind. Common patterns include:
- Confirmation toasts via `sonner`.
- Conditional form validation with real-time error messaging.
- Loading states with spinners and disabled UI.
- Mobile-first responsive layouts using Tailwind responsive utilities.

### Data flow (current touchpoint creation)

1. **Scan** — User clicks “Add New” in Touchpoints list → opens drawer → scans a QR code.
2. **Verify** — Scanner validates the code via `check_touchpoint_code` (RPC) — ensures it exists, is inactive, and belongs to a valid variant.
3. **Form** — Scanner displays a form with fields: Business Name (editable), Google Maps URL, Email, Phone. It fetches `variant_type` from the verification response and shows the scanned code as read-only.
4. **Submit** — Form submits to an RPC `activate_touchpoint` which (in current code) is not defined; the user sees an error. (This is the dead code path we plan to replace with direct Supabase insert.)
5. **Success** — After activation, touchpoints list should refresh and show the new touchpoint.

### Technologies & dependencies

#### Runtime
| Package | Purpose |
|---|---|
| `@supabase/ssr` | Server/client Supabase auth integration |
| `@supabase/supabase-js` | Core client |
| `@yudiel/react-qr-scanner` | QR scanning for touchpoint activation |
| `groq-sdk` | AI-generated review drafts |
| `zustand` | State management |
| `class-variance-authority` + `cn` | Component variant utilities |
| `tw-animate-css` | Tailwind animation utilities |

#### Build tooling
| Tool | Role |
|---|---|
| Next.js 16 + Turbopack | React framework and dev server |
| pnpm 11.3.0 | Package manager (lockfile present) |
| Tailwind 4 + shadcn/ui | Styling and component library |
| eslint + @next/eslint-config-next | Code quality |

### Current status (based on git)

- **Major milestones completed**
  - Git repo initialized, migrations up to `20261029075456` (inventory variants, businesses, users, plans).
  - Core UI components (shaded, buttons, inputs, cards) ready.
  - Auth flow (login, signup, Google OAuth callback) functional.
  - Middleware protection and SSR Supabase clients integrated.
  - Business CRUD implemented (business-cards).
  - Touchpoint listing (`touchpoints.tsx`) and scanning (`scanner.tsx`) exist but are incomplete: RPC `activate_touchpoint` missing, insert into `touchpoints` not yet performed.
  - Review generation API (`/api/generate-review`) stub exists but validation and error handling need refinement.

- **In-progress**
  - `app/analytics/page.tsx` and `app/account/page.tsx` are placeholders.
  - Workspace touchpoint CRUD (activation/creation) needs implementation.
  - Real-time syncing and touchpoint metadata normalization.

- **Planned**
  - Finalize drawer form for touchpoint creation with the exact fields requested (editable touchpoint name, readonly variant name & code).
  - Direct Supabase insert for touchpoints (no RPC).
  - Edge-case validation, error handling, and RLS compliance.

### Development conventions

- **ponytail discipline** (full intensity) — every change is evaluated against the ladder:
  1. Does this need to exist at all? (YAGNI)
  2. Already in this codebase? Reuse before re-implement.
  3. Stdlib does it? Use it.
  4. Native platform feature covers it? Prefer `<input type="date">` over a picker lib.
  5. Already-installed dependency solves it? Use it; never add a new one.
  6. Can it be one line? Use the shortest working solution.
  7. Only then: minimal code that works.

- **Component structure** — minimal, self-contained, no extra abstraction unless reused across ≥2 components.
- **Form handling** — controlled components with `useState`, validation at the edge (trim, length, regex).
- **Error handling** — consistent use of `toast.error` and logging to console in development; user-friendly messages.
- **Security** — RLS enforced, inputs sanitized at the edge (trim, length), metadata stored as JSONB.
- **Testing** — not yet present, but any new logic includes a small inline self-check or clear verification steps.

### Known missing pieces (per docs/TASKS.md)
- Analytics page content.
- Account page (accounts) implementation.
- `touchpoint-drawer.tsx` form not implemented (currently only scanner).
- Missing: correct touchpoint insert with fields per request.
- `activate_touchpoint` RPC is referenced but not defined; must be replaced with direct query.

### How to run
1. Ensure `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `GROQ_API_KEY`.
2. Run `pnpm install` (lockfile present).
3. Run `pnpm dev` to start the development server.
4. Open `http://localhost:3000/workspace` after signing in.

### How to test (manual)
1. Sign in, create a business via BusinessCards.
2. Add a touchpoint — scan a code (seed data provides codes for flyers, cards, etc.).
3. Enter the touchpoint name (editable), see readonly variant type and code.
4. Submit — should insert a row into `touchpoints` with the correct `business_id`, `code`, `metadata.name`, and `status='active'`.
5. Verify the new touchpoint appears in the touchpoints list.
6. Try submitting with empty name (should block).
7. Verify no external calls to `productmate.com` are made (field removal).

## Files summary

Key file paths:
- Root: `app/layout.tsx`, `app/workspace/page.tsx`
- Shared: `components/shared/app-shell.tsx`, `proxy.ts`, `lib/client.ts`, `lib/server.ts`
- Business: `components/workspace/business-cards.tsx`
- Touchpoints: `components/workspace/touchpoints.tsx`, `components/workspace/studio/visibility-tab.tsx`, `components/workspace/studio/touchpoint-drawer.tsx`, `components/workspace/scanner.tsx`
- DB: `supabase/migrations/` (each `*.sql`), `supabase/seed.sql`
- API: `api/generate-review/route.ts`
- Store: `stores/use-business-store.ts`, `stores/use-touchpoint-store.ts`
- Utils: `lib/utils.ts` (export `cn`)

## Next steps
- Implement the drawer form update per the plan (scanner.tsx + drawer props).
- Run tests once the application is functional.
- Add real analytics data and account page content.
- Consider seeding more inventory codes or exposing variant names for better UX.