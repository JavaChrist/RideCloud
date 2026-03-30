create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('voitures', 'motos', 'scooters', 'utilitaires')),
  marque text not null,
  modele text not null,
  annee integer not null,
  kilometrage integer not null default 0,
  date_achat date,
  carburant text,
  immatriculation text,
  vin text,
  surnom text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  titre text not null,
  date_entretien date not null,
  kilometrage integer not null,
  cout numeric(10,2),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.upcoming_maintenance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  titre text not null,
  due_date date,
  due_km integer,
  niveau_urgence text not null default 'normal' check (niveau_urgence in ('normal', 'urgent')),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.modifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  titre text not null,
  marque text,
  modele text,
  date_pose date,
  cout numeric(10,2),
  facture_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  nom_fichier text not null,
  type_fichier text not null,
  url text not null,
  taille integer,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id)
  do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.maintenance_entries enable row level security;
alter table public.upcoming_maintenance enable row level security;
alter table public.modifications enable row level security;
alter table public.documents enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

drop policy if exists "vehicles_all_own" on public.vehicles;
create policy "vehicles_all_own" on public.vehicles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "maintenance_all_own" on public.maintenance_entries;
create policy "maintenance_all_own" on public.maintenance_entries
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "upcoming_all_own" on public.upcoming_maintenance;
create policy "upcoming_all_own" on public.upcoming_maintenance
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "modifications_all_own" on public.modifications;
create policy "modifications_all_own" on public.modifications
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "documents_all_own" on public.documents;
create policy "documents_all_own" on public.documents
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('ridecloud-files', 'ridecloud-files', false)
on conflict (id) do nothing;

drop policy if exists "storage_select_own" on storage.objects;
create policy "storage_select_own" on storage.objects
for select using (
  bucket_id = 'ridecloud-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "storage_insert_own" on storage.objects;
create policy "storage_insert_own" on storage.objects
for insert with check (
  bucket_id = 'ridecloud-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "storage_update_own" on storage.objects;
create policy "storage_update_own" on storage.objects
for update using (
  bucket_id = 'ridecloud-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "storage_delete_own" on storage.objects;
create policy "storage_delete_own" on storage.objects
for delete using (
  bucket_id = 'ridecloud-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);
