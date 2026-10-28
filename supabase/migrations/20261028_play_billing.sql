-- Prestataire de facturation : Mollie (web) ou Google Play (Android).
-- Colonnes additives : les abonnements Mollie existants restent intacts.

alter table public.profiles
  add column if not exists billing_provider text,
  add column if not exists play_product_id text,
  add column if not exists play_purchase_token text,
  add column if not exists play_order_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_billing_provider_check'
  ) then
    alter table public.profiles
      add constraint profiles_billing_provider_check
      check (billing_provider is null or billing_provider in ('mollie', 'play'));
  end if;
end $$;

create unique index if not exists profiles_play_purchase_token_uidx
  on public.profiles (play_purchase_token)
  where play_purchase_token is not null;

update public.profiles
set billing_provider = 'mollie'
where billing_provider is null
  and mollie_subscription_id is not null;

comment on column public.profiles.billing_provider is
  'Prestataire qui facture l''abonnement courant : mollie (web) ou play (Android).';
comment on column public.profiles.play_purchase_token is
  'Jeton Google Play. Sert à la vérif Publisher API et aux notifications RTDN.';
