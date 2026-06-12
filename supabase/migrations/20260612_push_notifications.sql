-- ============================================================================
-- Notifications push (Web Push API + VAPID)
-- ----------------------------------------------------------------------------
-- Deux tables :
--   * push_subscriptions : un device souscrit (endpoint browser + clés P256).
--     Un utilisateur peut avoir plusieurs devices (téléphone + desktop).
--   * notification_log   : trace d'envoi pour anti-spam (1 envoi max par
--     sujet/véhicule dans une fenêtre temporelle).
--
-- Migration idempotente : on n'écrase rien et on supporte plusieurs runs.
-- ============================================================================

-- 1) push_subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_error_at timestamptz,
  last_error_reason text
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Politique : chaque utilisateur ne voit/modifie que ses propres souscriptions.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'push_subscriptions'
      and policyname = 'push_subs_select_own'
  ) then
    create policy push_subs_select_own
      on public.push_subscriptions for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'push_subscriptions'
      and policyname = 'push_subs_insert_own'
  ) then
    create policy push_subs_insert_own
      on public.push_subscriptions for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'push_subscriptions'
      and policyname = 'push_subs_update_own'
  ) then
    create policy push_subs_update_own
      on public.push_subscriptions for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'push_subscriptions'
      and policyname = 'push_subs_delete_own'
  ) then
    create policy push_subs_delete_own
      on public.push_subscriptions for delete
      using (auth.uid() = user_id);
  end if;
end $$;

comment on table public.push_subscriptions is
  'Web Push subscriptions (un par device). Le service_role peut tout lire pour envoyer les notifications côté cron.';

-- 2) notification_log : anti-spam et historique
-- kind : 'odometer_refresh' (rappel compteur) | 'maintenance_due' (entretien)
-- subject_id : pour les entretiens, l'id du plan_entry concerné. Null pour le rappel compteur.
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  kind text not null check (kind in ('odometer_refresh','maintenance_due')),
  subject_id uuid,
  sent_at timestamptz not null default now(),
  payload jsonb
);

create index if not exists notification_log_user_vehicle_idx
  on public.notification_log (user_id, vehicle_id);
create index if not exists notification_log_sent_at_idx
  on public.notification_log (sent_at desc);

alter table public.notification_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_log'
      and policyname = 'notification_log_select_own'
  ) then
    create policy notification_log_select_own
      on public.notification_log for select
      using (auth.uid() = user_id);
  end if;
end $$;
-- Les inserts/updates/deletes ne sont accessibles qu'au service_role
-- (utilisé par la route cron). C'est le comportement par défaut sans policy
-- d'insert/update/delete : RLS rejette tout ce qui n'est pas service_role.

comment on table public.notification_log is
  'Trace d''envoi des notifications push. Sert d''anti-spam : on ne renotifie pas un même sujet/véhicule dans une fenêtre donnée.';
