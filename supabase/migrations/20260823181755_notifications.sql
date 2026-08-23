-- ============================================================================
-- Notifications persistantes (inbox / compteur non lu)
-- ----------------------------------------------------------------------------
-- Source de vérité future pour l'inbox, le compteur, la cloche et le badge.
-- Ne remplace PAS notification_log (journal d'envoi Push uniquement).
-- ============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  type text not null,
  title text not null,
  body text not null,
  href text,
  dedupe_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  last_pushed_at timestamptz,
  unique (user_id, dedupe_key)
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

comment on table public.notifications is
  'Notifications métier persistantes. Source de vérité inbox / non-lus. Distinct de notification_log.';

alter table public.notifications enable row level security;

revoke insert, update, delete on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_select_own'
  ) then
    create policy notifications_select_own
      on public.notifications for select
      using (auth.uid() = user_id);
  end if;
end $$;

-- Lecture uniquement via RPC (pas de policy UPDATE client).
-- search_path vide : aucun objet non qualifié n'est résolu.
create or replace function public.mark_notification_read(notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.notifications
     set read_at = pg_catalog.now()
   where id = notification_id
     and user_id = auth.uid()
     and read_at is null;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.notifications
     set read_at = pg_catalog.now()
   where user_id = auth.uid()
     and read_at is null;
end;
$$;

revoke all on function public.mark_notification_read(uuid) from public, anon;
grant execute on function public.mark_notification_read(uuid) to authenticated;

revoke all on function public.mark_all_notifications_read() from public, anon;
grant execute on function public.mark_all_notifications_read() to authenticated;

comment on function public.mark_notification_read(uuid) is
  'Marque une notification de auth.uid() comme lue. Idempotent. SECURITY DEFINER.';

comment on function public.mark_all_notifications_read() is
  'Marque toutes les notifications non lues de auth.uid() comme lues. SECURITY DEFINER.';
