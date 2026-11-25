-- Enable required extension
create extension if not exists "pgcrypto";

-- Create status enum (safe for re-run)
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'inventory_status_enum'
  ) then
    create type public.inventory_status_enum as enum ('active', 'inactive');
  end if;
end$$;

-- Create inventory table
create table if not exists public.inventory (
  code text primary key CHECK ( code ~ '^\+?[a-z0-9]{5}$'),
  variant_id uuid not null references public.variant(id) on delete cascade,
  status public.inventory_status_enum not null default 'inactive',
  metadata jsonb not null default jsonb_build_object(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_code_status ON public.inventory(code, status);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Func to check if a touchpoint code is valid and inactive
drop function if exists public.check_touchpoint_code(text);

create or replace function public.check_touchpoint_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_status public.inventory_status_enum;
  v_variant_type public.variant_type_enum;
begin
  if auth.uid() is null then
    return jsonb_build_object(
      'success', false,
      'code', 'UNAUTHORIZED',
      'message', 'Authentication required.'
    );
  end if;

  if p_code is null or trim(p_code) = '' then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Touchpoint code is required.'
    );
  end if;

  v_code := lower(trim(p_code));

  if v_code !~ '^\+?[a-z0-9]{5}$' then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_FORMAT',
      'message', 'Invalid touchpoint code format.'
    );
  end if;

  select i.code, i.status, v.type
  into v_code, v_status, v_variant_type
  from public.inventory i
  join public.variant v on v.id = i.variant_id
  where i.code = lower(trim(p_code))
  limit 1;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'NOT_FOUND',
      'message', 'Touchpoint not found.'
    );
  end if;

  if v_status <> 'inactive'::public.inventory_status_enum then
    return jsonb_build_object(
      'success', false,
      'code', 'UNAVAILABLE',
      'message', 'This touchpoint is already claimed or unavailable.'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'message', 'Touchpoint verified successfully.',
    'data', jsonb_build_object(
      'code', v_code,
      'status', v_status,
      'variant_type', v_variant_type
    )
  );

exception
  when others then
    raise warning 'check_touchpoint_code failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;

    return jsonb_build_object(
      'success', false,
      'code', 'INTERNAL_ERROR',
      'message', 'Unable to verify touchpoint. Please try again.'
    );
end;
$$;

revoke all on function public.check_touchpoint_code(text) from public;
grant execute on function public.check_touchpoint_code(text) to authenticated;