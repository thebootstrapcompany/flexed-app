-- Enable required extension
create extension if not exists "pgcrypto";

-- Create type enum (safe for re-run)
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'variant_type_enum'
  ) then
    create type public.variant_type_enum as enum ('flyer', 'card', 'display', 'standee');
  end if;
end$$;

-- Create status enum (safe for re-run)
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'variant_status_enum'
  ) then
    create type public.variant_status_enum as enum ('active', 'inactive');
  end if;
end$$;

-- Create variant table
create table if not exists public.variant(
  id uuid primary key default gen_random_uuid(),
  type public.variant_type_enum not null,
  status public.variant_status_enum not null default 'active',
  metadata jsonb not null default jsonb_build_object(
    'name', '',
    'class', '',
    'description', '',
    'image_path', '',
    'price', 0,
    'original_price', 0,
    'dimensions', jsonb_build_object(
      'width', '',
      'height', '',
      'depth', ''
    ),
    'material', '',
    'color', '',
    'popularity', 0,
    'additional_info', jsonb_build_object(),
    'availability', jsonb_build_object(
      'in_stock', true,
      'quantity', 0
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchpoints_user_id ON public.variant(status);

-- Enable RLS
ALTER TABLE public.variant ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT ON TABLE public.variant TO authenticated;
GRANT SELECT ON TABLE public.variant TO anon;

--- RLS policies
create policy "Users can view variant items with active status"
on public.variant
as permissive
for select
to anon, authenticated
using (
  status = 'active'
);