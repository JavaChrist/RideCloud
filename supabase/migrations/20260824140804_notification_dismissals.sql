-- ============================================================================
-- Tombstones de notifications dismissées (user_id, dedupe_key)
-- ----------------------------------------------------------------------------
-- Une suppression inbox ne doit pas être recréée par le cron pour la même
-- occurrence. Distinct de notification_log (journal Push) : aucun impact
-- sur les envois déjà partis.
-- ============================================================================

create table if not exists public.notification_dismissals (
  user_id uuid not null references auth.users(id) on delete cascade,
  dedupe_key text not null,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, dedupe_key)
);

comment on table public.notification_dismissals is
  'Occurrences explicitement supprimées par l''utilisateur. Empêche le cron de recréer (user_id, dedupe_key).';

alter table public.notification_dismissals enable row level security;

revoke all on public.notification_dismissals from anon, authenticated;

-- Enregistre le tombstone à chaque DELETE inbox (y compris via RLS client).
-- Si l'utilisateur auth est déjà parti (cascade), on n'insère pas.
create or replace function public.notifications_record_dismissal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from auth.users u where u.id = old.user_id
  ) then
    return old;
  end if;

  insert into public.notification_dismissals (user_id, dedupe_key)
  values (old.user_id, old.dedupe_key)
  on conflict (user_id, dedupe_key) do nothing;

  return old;
end;
$$;

drop trigger if exists notifications_record_dismissal on public.notifications;
create trigger notifications_record_dismissal
  after delete on public.notifications
  for each row execute function public.notifications_record_dismissal();

-- Filet SQL : même le cron service_role ne peut pas réinsérer une occurrence dismissée.
create or replace function public.notifications_reject_dismissed_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
      from public.notification_dismissals d
     where d.user_id = new.user_id
       and d.dedupe_key = new.dedupe_key
  ) then
    raise exception 'NOTIFICATION_DISMISSED'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists notifications_reject_dismissed_insert on public.notifications;
create trigger notifications_reject_dismissed_insert
  before insert on public.notifications
  for each row execute function public.notifications_reject_dismissed_insert();
