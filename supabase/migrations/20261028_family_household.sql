-- Foyer Family : jusqu'à 4 comptes partagent le garage tant que
-- le titulaire a un plan Family actif.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create unique index if not exists household_members_user_unique
  on public.household_members (user_id);

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email text not null,
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz
);

create index if not exists household_invites_household_idx
  on public.household_invites (household_id);

create unique index if not exists household_invites_pending_email_idx
  on public.household_invites (household_id, email)
  where accepted_at is null and revoked_at is null;

comment on table public.households is
  'Foyer Family. Un titulaire (abonnement Family actif) et jusqu''à 3 membres.';
comment on table public.household_members is
  'Membres d''un foyer. Un utilisateur ne peut appartenir qu''à un seul foyer.';
comment on table public.household_invites is
  'Invitations e-mail au foyer. Token opaque, sans donnée personnelle dans l''URL au-delà de l''UUID.';

-- ---------------------------------------------------------------------------
-- Helpers SECURITY DEFINER (évite la récursion RLS)
-- ---------------------------------------------------------------------------

create or replace function public.my_household_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id
  from public.household_members
  where user_id = auth.uid();
$$;

create or replace function public.family_household_is_active(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.households h
    join public.profiles p on p.id = h.owner_id
    where h.id = p_household_id
      and p.plan = 'family'
      and p.plan_status = 'active'
      and (
        p.plan_canceled_at is null
        or p.plan_renews_at is null
        or p.plan_renews_at > now()
      )
  );
$$;

create or replace function public.is_household_peer(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members me
    join public.household_members peer
      on peer.household_id = me.household_id
     and peer.user_id = target_user_id
    where me.user_id = auth.uid()
      and public.family_household_is_active(me.household_id)
  );
$$;

create or replace function public.can_access_vehicle(p_vehicle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vehicles v
    where v.id = p_vehicle_id
      and (
        v.user_id = auth.uid()
        or public.is_household_peer(v.user_id)
      )
  );
$$;

revoke all on function public.my_household_ids() from public;
revoke all on function public.family_household_is_active(uuid) from public;
revoke all on function public.is_household_peer(uuid) from public;
revoke all on function public.can_access_vehicle(uuid) from public;
grant execute on function public.my_household_ids() to authenticated;
grant execute on function public.family_household_is_active(uuid) to authenticated;
grant execute on function public.is_household_peer(uuid) to authenticated;
grant execute on function public.can_access_vehicle(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS foyer
-- ---------------------------------------------------------------------------

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;

drop policy if exists households_select_member on public.households;
create policy households_select_member on public.households
  for select using (id in (select public.my_household_ids()));

drop policy if exists household_members_select_own on public.household_members;
create policy household_members_select_own on public.household_members
  for select using (household_id in (select public.my_household_ids()));

drop policy if exists household_invites_select_owner on public.household_invites;
create policy household_invites_select_owner on public.household_invites
  for select using (
    household_id in (
      select h.id from public.households h
      where h.owner_id = auth.uid()
    )
  );

-- Mutations foyer : uniquement via service_role (API serveur).

-- ---------------------------------------------------------------------------
-- RLS véhicules + données liées
-- ---------------------------------------------------------------------------

drop policy if exists "vehicles_all_own" on public.vehicles;
drop policy if exists vehicles_select_own_or_household on public.vehicles;
drop policy if exists vehicles_insert_own on public.vehicles;
drop policy if exists vehicles_update_own_or_household on public.vehicles;
drop policy if exists vehicles_delete_own on public.vehicles;

create policy vehicles_select_own_or_household on public.vehicles
  for select using (auth.uid() = user_id or public.is_household_peer(user_id));

create policy vehicles_insert_own on public.vehicles
  for insert with check (auth.uid() = user_id);

create policy vehicles_update_own_or_household on public.vehicles
  for update
  using (auth.uid() = user_id or public.is_household_peer(user_id))
  with check (auth.uid() = user_id or public.is_household_peer(user_id));

create policy vehicles_delete_own on public.vehicles
  for delete using (auth.uid() = user_id);

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'maintenance_entries',
    'upcoming_maintenance',
    'maintenance_plan_entries',
    'modifications',
    'documents'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', tbl || '_all_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_select_access', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_insert_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_update_access', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_delete_access', tbl);

    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id or public.can_access_vehicle(vehicle_id))',
      tbl || '_select_access', tbl
    );
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id and public.can_access_vehicle(vehicle_id))',
      tbl || '_insert_own', tbl
    );
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id or public.can_access_vehicle(vehicle_id)) with check (auth.uid() = user_id or public.can_access_vehicle(vehicle_id))',
      tbl || '_update_access', tbl
    );
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id or public.can_access_vehicle(vehicle_id))',
      tbl || '_delete_access', tbl
    );
  end loop;
end $$;

-- Photos / documents du titulaire visibles par le foyer
drop policy if exists storage_select_household on storage.objects;
create policy storage_select_household on storage.objects
  for select using (
    bucket_id = 'ridecloud-files'
    and public.is_household_peer(
      case
        when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then ((storage.foldername(name))[1])::uuid
        else null
      end
    )
  );
