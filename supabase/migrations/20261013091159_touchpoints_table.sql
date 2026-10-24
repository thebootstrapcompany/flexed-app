-- Enable required extension
create extension if not exists "pgcrypto";

-- Create status enum (safe for re-run)
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'touchpoint_status_enum'
  ) then
    create type public.touchpoint_status_enum as enum ('active', 'inactive');
  end if;
end$$;

-- Create touchpoints table
create table if not exists public.touchpoints (
  code text primary key not null unique CONSTRAINT touchpoint_code_check CHECK ( code ~ '^\+?[a-z0-9]{5,5}$'),
  status public.touchpoint_status_enum default 'inactive' not null,
  metadata jsonb not null default jsonb_build_object(
    'customization', false,
    'analytics', false
  ),
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.touchpoints ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.touchpoints TO authenticated;

--- RLS policies
create policy "Everyone can view qr codes"
on public.touchpoints
as permissive
for select
to authenticated
using (
  status = 'inactive'
);