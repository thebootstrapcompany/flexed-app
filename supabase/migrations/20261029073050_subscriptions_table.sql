-- Enable required extension
create extension if not exists "pgcrypto";

-- Create businesses table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  renewal_date date not null default CURRENT_DATE,
  expiry_date date default CURRENT_DATE + interval '29 days' not null,
  created_at timestamptz not null default now(),

  CONSTRAINT subscriptions_dates_check CHECK (expiry_date >= renewal_date)
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT, INSERT ON TABLE public.subscriptions TO authenticated;

--- RLS policies
create policy "Users can view own subscriptions"
on public.subscriptions
as permissive
for select
to authenticated
using (
  user_id = (SELECT auth.uid())
);