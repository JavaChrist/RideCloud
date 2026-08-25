-- Tokens Push natifs (FCM Android, futur APNs iOS).
-- Distinct de push_subscriptions (Web Push VAPID).

create table if not exists public.native_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('android', 'ios')),
  token text not null unique,
  installation_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create unique index if not exists native_push_tokens_user_install_idx
  on public.native_push_tokens (user_id, installation_id)
  where installation_id is not null;

create index if not exists native_push_tokens_user_id_idx
  on public.native_push_tokens (user_id);

alter table public.native_push_tokens enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'native_push_tokens'
      and policyname = 'native_push_tokens_select_own'
  ) then
    create policy native_push_tokens_select_own
      on public.native_push_tokens for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'native_push_tokens'
      and policyname = 'native_push_tokens_insert_own'
  ) then
    create policy native_push_tokens_insert_own
      on public.native_push_tokens for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'native_push_tokens'
      and policyname = 'native_push_tokens_update_own'
  ) then
    create policy native_push_tokens_update_own
      on public.native_push_tokens for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'native_push_tokens'
      and policyname = 'native_push_tokens_delete_own'
  ) then
    create policy native_push_tokens_delete_own
      on public.native_push_tokens for delete
      using (auth.uid() = user_id);
  end if;
end $$;

comment on table public.native_push_tokens is
  'Tokens FCM/APNs natifs. Distinct de push_subscriptions (Web Push). service_role pour l''envoi serveur.';
