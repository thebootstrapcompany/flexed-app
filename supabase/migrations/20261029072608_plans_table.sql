-- Enable required extension
create extension if not exists "pgcrypto";

-- Create status enum (safe for re-run)
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'plan_status_enum'
  ) then
    create type public.plan_status_enum as enum ('active', 'inactive');
  end if;
end$$;

-- Create businesses table
create table if not exists public.plans (
  id uuid primary key not null unique default gen_random_uuid(),
  name text not null,
  amount numeric not null default 0 check (amount >= 0),
  duration_days integer default 28 check (duration_days > 0),
  status public.plan_status_enum not null default 'active',
  badge text,
  features jsonb not null default jsonb_build_object(
    'user_analytics', true,
    'business_analytics', true,
    'touchpoint_analytics', false,
    'catalogue', false,
    'domain_enabled', false,
    'pages_enabled', false,
    'anon_messages', false,
    'automated_replies', false,
    'review_suggestions', false,
    'seo_optimization', false
  ),
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT ON TABLE public.plans TO public;

--- RLS policies
create policy "Everyone can view qr codes"
on public.plans
as permissive
for select
to anon, authenticated
using (
  true
);