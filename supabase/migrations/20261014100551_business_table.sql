-- Enable required extension
create extension if not exists "pgcrypto";

-- Create businesses table
create table if not exists public.businesses (
    code text primary key not null unique references public.touchpoints(code) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    slug text unique,
    name text not null,
    email text constraint businesses_email_check check (email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    phone text constraint businesses_phone_check check (phone is null or phone ~ '^\+?[0-9]{10}$'),
    links jsonb not null default '{}'::jsonb,
    metadata jsonb not null default jsonb_build_object(
        'desc', '',
        'bg_path', '',
        'hero_path', '',
        'automation', jsonb_build_object(
            'tone', 'Balanced',
            'language', 'English',
            'length', 'Medium',
            'instructions', ''
        )
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.businesses TO authenticated;

--- RLS policies
create policy "Everyone can view qr codes"
on public.businesses
as permissive
for select
using (
  true
);

CREATE POLICY "Users can insert their own qr codes"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Users can update their own qr codes"
ON public.businesses
FOR UPDATE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
)
WITH CHECK (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Users can delete their own businesses"
ON public.businesses
FOR DELETE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);