-- Play Billing v2 : historique durable token ↔ compte, RTDN, plan de base.
-- Non destructif : colonnes additives, tables nouvelles, RLS service_role.

alter table public.profiles
  add column if not exists play_base_plan_id text;

comment on column public.profiles.play_base_plan_id is
  'Dernier basePlanId Play appliqué au profil courant. L''historique est dans play_purchases.';

create table if not exists public.play_purchases (
  purchase_token text primary key,
  user_id uuid references public.profiles (id) on delete set null,
  product_id text not null,
  base_plan_id text not null,
  offer_id text,
  package_name text not null,
  order_id text,
  obfuscated_account_id text,
  linked_purchase_token text,
  superseded_by text,
  subscription_state text,
  acknowledgement_state text,
  expiry_time timestamptz,
  acknowledged_at timestamptz,
  ack_attempts integer not null default 0,
  ack_last_error text,
  ack_next_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists play_purchases_user_id_idx
  on public.play_purchases (user_id);

create index if not exists play_purchases_ack_retry_idx
  on public.play_purchases (ack_next_retry_at)
  where acknowledged_at is null;

create table if not exists public.play_rtdn_events (
  message_id text primary key,
  package_name text,
  notification_type integer,
  purchase_token text,
  payload jsonb,
  process_status text not null default 'pending',
  process_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint play_rtdn_events_status_check
    check (process_status in ('pending', 'applied', 'skipped', 'failed', 'orphan'))
);

create index if not exists play_rtdn_events_status_idx
  on public.play_rtdn_events (process_status, updated_at);

alter table public.play_purchases enable row level security;
alter table public.play_rtdn_events enable row level security;

revoke all on table public.play_purchases from anon, authenticated;
revoke all on table public.play_rtdn_events from anon, authenticated;
grant all on table public.play_purchases to service_role;
grant all on table public.play_rtdn_events to service_role;

comment on table public.play_purchases is
  'Association durable purchaseToken ↔ compte RideCloud. Un champ profil ne suffit pas.';
comment on table public.play_rtdn_events is
  'RTDN Pub/Sub dédupliqués, avec état de traitement et reprise.';

comment on function public.family_household_is_active(uuid) is
  'Foyer actif si le titulaire est Family + plan_status=active (grâce et résilié encore payé). Hold/pause = past_due : foyer inactif.';
