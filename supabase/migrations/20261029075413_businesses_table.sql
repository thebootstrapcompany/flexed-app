-- Enable required extension
create extension if not exists "pgcrypto";

-- Create businesses table
create table if not exists public.businesses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    username text unique,
    name text not null,
    email text check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    phone text check (phone ~ '^\+?[0-9]{10}$'),
    links jsonb not null default jsonb_build_object(
      'maps', '',
      'reviews', '',
      'website', '',
      'facebook', '',
      'instagram', '',
      'youtube', '',
      'whatsapp', ''
    ),
    metadata jsonb not null default jsonb_build_object(
      'desc', '',
      'is_verified', false
    ),
    features jsonb not null default jsonb_build_object(
      'user_analytics', true,
      'business_analytics', true,
      'domain_enabled', false,
      'pages_enabled', false,
      'touchpoint_analytics', false,
      'catalogue', false,
      'anon_messages', false,
      'automated_replies', false,
      'review_suggestions', false,
      'seo_optimization', false
    ),
    assets jsonb not null default jsonb_build_object(
      'bg_path', '',
      'logo_path', ''
    ),
    automation jsonb not null default jsonb_build_object(
      'tone', 'Balanced',
      'language', 'English',
      'length', 'Short',
      'keywords', jsonb_build_array(),
      'instructions', ''
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_username on public.businesses(username);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT ON public.businesses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.businesses TO authenticated;

--- RLS policies
create policy "Everyone can view businesses"
on public.businesses
as permissive
for select
TO anon, authenticated
using (
  true
);

CREATE POLICY "Users can insert own businesses"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
);

CREATE POLICY "Users can update own businesses"
ON public.businesses
FOR UPDATE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
)
WITH CHECK (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Users can delete own businesses"
ON public.businesses
FOR DELETE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);