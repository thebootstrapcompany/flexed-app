-- Enable required extension
create extension if not exists "pgcrypto";

-- Create businesses table
create table if not exists public.users (
  id uuid primary key not null unique default gen_random_uuid(),
  subscription_id uuid default null references public.subscriptions(id) on delete set null,
  metadata jsonb not null default jsonb_build_object(
    'email_verified', false,
    'phone_verified', false
  ),
  updated_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant Permissions
GRANT SELECT ON TABLE public.subscriptions TO authenticated;

--- RLS policies
create policy "Users can view own profile"
on public.subscriptions
as permissive
for select
to authenticated
using (
  user_id = (SELECT auth.uid())
);

-- Func to create a new user in the users table when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id) 
  VALUES (NEW.id) 
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to call the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_user_signup ON auth.users;
CREATE TRIGGER on_user_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();