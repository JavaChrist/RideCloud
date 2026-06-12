-- ============================================================================
-- Estimation du kilométrage par profil d'usage
-- ----------------------------------------------------------------------------
-- Ajoute à `vehicles` un profil d'usage (`usage_profile`), la moyenne
-- kilométrique annuelle dérivée (`avg_km_per_year`), et un point de
-- recalage du compteur (`last_odometer_value` + `last_odometer_date`) qui
-- permet d'estimer en continu le kilométrage courant entre deux saisies
-- manuelles.
--
-- Migration idempotente : on n'écrase rien et on supporte plusieurs runs.
-- Compatible avec les véhicules déjà présents en base : on initialise les
-- nouvelles colonnes à partir des données existantes (`kilometrage`,
-- `category`).
-- ============================================================================

-- 1) Ajout des colonnes (nullable d'abord, on backfill ensuite)
alter table public.vehicles
  add column if not exists usage_profile text,
  add column if not exists avg_km_per_year integer,
  add column if not exists last_odometer_value integer,
  add column if not exists last_odometer_date date,
  add column if not exists last_estimation_reminder_at timestamptz;

-- 2) Contrainte CHECK sur usage_profile (idempotente)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vehicles_usage_profile_check'
  ) then
    alter table public.vehicles
      add constraint vehicles_usage_profile_check
      check (usage_profile in ('daily','often','occasional','rare'));
  end if;
end $$;

-- 3) Backfill : pour les véhicules existants, on définit un profil par
-- défaut, on calcule avg_km_per_year en fonction du couple (profil,
-- catégorie), et on initialise le point de recalage sur le kilométrage
-- actuel à la date du jour. Ces véhicules pourront affiner leur profil
-- ensuite via la fiche.
update public.vehicles
   set usage_profile = coalesce(usage_profile, 'occasional')
 where usage_profile is null;

update public.vehicles
   set avg_km_per_year = coalesce(
     avg_km_per_year,
     case usage_profile
       when 'daily' then case category
         when 'voitures' then 15000
         when 'motos' then 12000
         when 'scooters' then 5000
         when 'utilitaires' then 25000
         else 10000
       end
       when 'often' then case category
         when 'voitures' then 10000
         when 'motos' then 7000
         when 'scooters' then 3000
         when 'utilitaires' then 15000
         else 7000
       end
       when 'occasional' then case category
         when 'voitures' then 6000
         when 'motos' then 4000
         when 'scooters' then 1500
         when 'utilitaires' then 8000
         else 4000
       end
       when 'rare' then case category
         when 'voitures' then 3000
         when 'motos' then 2000
         when 'scooters' then 800
         when 'utilitaires' then 4000
         else 2000
       end
       else 6000
     end
   )
 where avg_km_per_year is null;

update public.vehicles
   set last_odometer_value = coalesce(last_odometer_value, kilometrage)
 where last_odometer_value is null;

update public.vehicles
   set last_odometer_date = coalesce(last_odometer_date, current_date)
 where last_odometer_date is null;

-- 4) NOT NULL + defaults (sur colonnes maintenant initialisées partout)
alter table public.vehicles
  alter column usage_profile set default 'occasional',
  alter column usage_profile set not null,
  alter column avg_km_per_year set not null,
  alter column last_odometer_value set not null,
  alter column last_odometer_date set default current_date,
  alter column last_odometer_date set not null;

-- 5) Commentaires (documentation auto-générée)
comment on column public.vehicles.usage_profile is
  'Profil d''usage saisi par l''utilisateur : daily | often | occasional | rare. Sert à estimer le rythme kilométrique entre deux saisies du compteur.';
comment on column public.vehicles.avg_km_per_year is
  'Moyenne km/an dérivée du couple (usage_profile, category). Recalculée côté app à chaque update du profil. Restera modifiable manuellement plus tard si besoin.';
comment on column public.vehicles.last_odometer_value is
  'Point de référence : dernière valeur réelle du compteur. Recalée à chaque saisie manuelle ET à chaque entretien enregistré.';
comment on column public.vehicles.last_odometer_date is
  'Date du dernier recalage du compteur (saisie manuelle ou entretien). Couplée à avg_km_per_year pour estimer le km courant.';
comment on column public.vehicles.last_estimation_reminder_at is
  'Dernière fois que l''app a invité l''utilisateur à mettre à jour son compteur (rappel non bloquant ~mensuel). Null = jamais.';
