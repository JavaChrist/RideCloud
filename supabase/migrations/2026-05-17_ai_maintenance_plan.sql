-- ============================================================================
-- RideCloud — Migration : Plans d'entretien générés par IA
-- ============================================================================
-- Cette migration ajoute :
--   1. Une colonne `template_source` à `maintenance_plan_entries` pour distinguer
--      les tâches issues du code (hardcoded), de l'IA, ou validées (approved)
--   2. Une table `maintenance_template_cache` pour mutualiser les plans générés
--      par IA entre tous les utilisateurs ayant le même couple marque/modèle
--
-- Sécurité :
--   - La table cache est lisible par tous les utilisateurs authentifiés
--     (cache partagé = pas de données personnelles, juste des paramètres
--     d'entretien constructeur)
--   - L'écriture passe par le `service_role` côté serveur uniquement
--
-- À exécuter : Supabase Dashboard → SQL Editor → Run query
-- Idempotent : peut être ré-exécuté sans dommage
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Colonne template_source sur maintenance_plan_entries
-- ----------------------------------------------------------------------------
alter table public.maintenance_plan_entries
  add column if not exists template_source text
  check (template_source in ('hardcoded', 'ai', 'community', 'approved'));

comment on column public.maintenance_plan_entries.template_source is
  'Origine du template d''entretien : hardcoded (code), ai (généré par LLM), community (utilisateur), approved (IA validé par admin)';

-- Backfill pour les lignes existantes : on considère qu'elles viennent du code
update public.maintenance_plan_entries
set template_source = 'hardcoded'
where template_source is null;

-- ----------------------------------------------------------------------------
-- 2. Table maintenance_template_cache (cache partagé inter-utilisateurs)
-- ----------------------------------------------------------------------------
create table if not exists public.maintenance_template_cache (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('voitures', 'motos', 'scooters', 'utilitaires')),
  marque_normalized text not null,
  modele_normalized text not null,
  annee integer,
  profile_name text not null,
  templates jsonb not null,
  source text not null default 'ai' check (source in ('ai', 'approved', 'community')),
  llm_model text,
  prompt_version text not null default 'v1',
  generated_at timestamptz not null default now(),
  validated_at timestamptz,
  validated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.maintenance_template_cache is
  'Cache partagé des plans d''entretien générés par IA. Indexé par (category, marque, modèle) pour permettre la réutilisation entre utilisateurs.';

-- Unicité par couple véhicule (un seul plan canonique par modèle)
create unique index if not exists maintenance_template_cache_unique_model_idx
  on public.maintenance_template_cache (category, marque_normalized, modele_normalized);

-- Index secondaires pour les recherches
create index if not exists maintenance_template_cache_category_idx
  on public.maintenance_template_cache (category);

create index if not exists maintenance_template_cache_marque_idx
  on public.maintenance_template_cache (marque_normalized);

-- ----------------------------------------------------------------------------
-- 3. RLS sur maintenance_template_cache
-- ----------------------------------------------------------------------------
alter table public.maintenance_template_cache enable row level security;

-- Lecture : tout utilisateur authentifié peut consulter le cache
drop policy if exists "template_cache_read_authenticated" on public.maintenance_template_cache;
create policy "template_cache_read_authenticated" on public.maintenance_template_cache
  for select
  using (auth.role() = 'authenticated');

-- Écriture : aucune politique → seul le service_role peut écrire (côté serveur)

-- ----------------------------------------------------------------------------
-- 4. Trigger pour maintenir updated_at à jour
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_maintenance_template_cache_updated_at on public.maintenance_template_cache;
create trigger set_maintenance_template_cache_updated_at
  before update on public.maintenance_template_cache
  for each row execute function public.set_updated_at();
