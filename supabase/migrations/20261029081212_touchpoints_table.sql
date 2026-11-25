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
  code text not null primary key references public.inventory(code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  status public.touchpoint_status_enum not null default 'active',
  metadata jsonb not null default jsonb_build_object(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_touchpoints_user_id ON public.touchpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_business_id ON public.touchpoints(business_id);

-- Enable RLS
ALTER TABLE public.touchpoints ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.touchpoints TO authenticated;

--- RLS policies
create policy "Users can view their own qr codes"
on public.touchpoints
as permissive
for select
to authenticated
using (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = touchpoints.business_id
      AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can insert own touchpoints"
ON public.touchpoints
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = touchpoints.business_id
      AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can update their own businesses"
ON public.touchpoints
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = touchpoints.business_id
      AND b.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = touchpoints.business_id
      AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can delete their own businesses"
ON public.touchpoints
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = touchpoints.business_id
      AND b.user_id = (SELECT auth.uid())
  )
);