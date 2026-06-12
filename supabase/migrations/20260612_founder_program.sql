-- =====================================================================
-- Migration : programme "Membres Fondateurs" (100 places limit)
--
-- Ce programme REMPLACE le programme bêta-testeurs : un seul programme
-- d'early adopters côté RideCloud. Aucun bêta-testeur en base au moment
-- de cette migration, donc on drop sans précaution.
--
-- À appliquer via le dashboard Supabase > SQL Editor (idempotente).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. NETTOYAGE : suppression de l'ancien programme bêta
-- ---------------------------------------------------------------------
drop table if exists public.beta_feedback cascade;
drop table if exists public.invite_codes  cascade;

alter table public.profiles
  drop column if exists beta_expires_at,
  drop column if exists beta_feedback_submitted;

-- ---------------------------------------------------------------------
-- 1. Colonnes fondateur sur profiles (mirroir lecture rapide / RLS limits)
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists founder_premium_lifetime boolean not null default false,
  add column if not exists founder_badge            boolean not null default false;

-- ---------------------------------------------------------------------
-- 2. Table des membres fondateurs
--    - slot 1..100, unique, sans trou (attribué côté serveur)
--    - 1 ligne par utilisateur (PK = user_id)
-- ---------------------------------------------------------------------
create table if not exists public.founder_members (
  user_id          uuid        primary key references auth.users(id) on delete cascade,
  slot             int         not null unique check (slot between 1 and 100),
  joined_at        timestamptz not null default now(),
  status           text        not null default 'pending'
                              check (status in ('pending', 'completed', 'expired')),
  completed_at     timestamptz,
  premium_lifetime boolean     not null default false,
  badge            boolean     not null default false
);

comment on table  public.founder_members is 'Programme Membres Fondateurs : 100 places limitées avec Premium à vie sur questionnaire complété.';
comment on column public.founder_members.slot is 'Numéro de fondateur 1..100, unique, attribué atomiquement par claim_founder_slot().';
comment on column public.founder_members.joined_at is 'Date d''obtention de la place (déclenche la fenêtre de 30 jours pour le questionnaire).';

-- ---------------------------------------------------------------------
-- 3. Table des réponses au questionnaire (1 seule par user)
-- ---------------------------------------------------------------------
create table if not exists public.founder_questionnaire_responses (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  slot          int         not null,
  usage         text        not null,
  nps           smallint    not null check (nps between 0 and 10),
  frustration   text        not null,
  top_feature   text        not null,
  pricing       text        not null,
  submitted_at  timestamptz not null default now(),
  unique (user_id)
);

comment on table public.founder_questionnaire_responses is 'Réponses au questionnaire des Membres Fondateurs (1 seule par utilisateur).';

-- ---------------------------------------------------------------------
-- 4. RLS — lecture de sa propre ligne uniquement ; aucune écriture directe
-- ---------------------------------------------------------------------
alter table public.founder_members enable row level security;
alter table public.founder_questionnaire_responses enable row level security;

drop policy if exists "founder_members_read_own" on public.founder_members;
create policy "founder_members_read_own"
  on public.founder_members
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "founder_responses_read_own" on public.founder_questionnaire_responses;
create policy "founder_responses_read_own"
  on public.founder_questionnaire_responses
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Aucune policy d'INSERT/UPDATE/DELETE : tout passe par les fonctions
-- SECURITY DEFINER ci-dessous, qui bypass RLS de manière contrôlée.

-- ---------------------------------------------------------------------
-- 5. RPC : claim_founder_slot()
--    - Idempotent : si l'utilisateur a déjà un slot, on le renvoie.
--    - Atomique : pg_advisory_xact_lock sérialise les insertions concurrentes.
--    - Renvoie jsonb :
--        { ok: true, slot: int, alreadyMember: bool }
--        { ok: false, reason: 'program_full' | 'not_authenticated' }
-- ---------------------------------------------------------------------
create or replace function public.claim_founder_slot()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_existing  int;
  v_count     int;
  v_new_slot  int;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  -- Idempotence : si l'utilisateur a déjà sa place, on la renvoie tel quel
  select slot into v_existing
    from public.founder_members
   where user_id = v_user;

  if found then
    return jsonb_build_object(
      'ok', true,
      'slot', v_existing,
      'alreadyMember', true
    );
  end if;

  -- Verrouillage advisory : un seul claim simultané pour tout le programme.
  -- Le lock est libéré automatiquement à la fin de la transaction.
  perform pg_advisory_xact_lock(hashtext('ridecloud.founder_program_claim'));

  -- Re-check idempotence après le lock (un autre call concurrent a pu insérer)
  select slot into v_existing
    from public.founder_members
   where user_id = v_user;

  if found then
    return jsonb_build_object(
      'ok', true,
      'slot', v_existing,
      'alreadyMember', true
    );
  end if;

  select count(*) into v_count from public.founder_members;

  if v_count >= 100 then
    return jsonb_build_object('ok', false, 'reason', 'program_full');
  end if;

  -- Attribution du prochain slot disponible
  select coalesce(max(slot), 0) + 1 into v_new_slot from public.founder_members;

  insert into public.founder_members (user_id, slot, joined_at, status)
  values (v_user, v_new_slot, now(), 'pending');

  return jsonb_build_object(
    'ok', true,
    'slot', v_new_slot,
    'alreadyMember', false
  );
end;
$$;

revoke all on function public.claim_founder_slot() from public;
grant execute on function public.claim_founder_slot() to authenticated;

comment on function public.claim_founder_slot() is
  'Réserve atomiquement une place fondateur (1..100). Idempotent. SECURITY DEFINER.';

-- ---------------------------------------------------------------------
-- 6. RPC : submit_founder_questionnaire()
--    - Contrôles serveur : place existe, questionnaire pas déjà rempli,
--      dans la fenêtre de 30 jours.
--    - Sur succès : enregistre les réponses, marque completed,
--      débloque premium_lifetime + badge, ET met à jour profiles.
--    - Renvoie jsonb :
--        { ok: true }
--        { ok: false, reason: 'no_slot' | 'already_done' | 'expired' | 'not_authenticated' }
-- ---------------------------------------------------------------------
create or replace function public.submit_founder_questionnaire(
  p_usage        text,
  p_nps          int,
  p_frustration  text,
  p_top_feature  text,
  p_pricing      text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_member   public.founder_members;
  v_deadline timestamptz;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  -- Validation des bornes (sécurité de défense : la base est la source de vérité)
  if p_nps is null or p_nps < 0 or p_nps > 10 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_nps');
  end if;

  if p_usage is null or length(trim(p_usage)) = 0
     or p_frustration is null or length(trim(p_frustration)) = 0
     or p_top_feature is null or length(trim(p_top_feature)) = 0
     or p_pricing is null or length(trim(p_pricing)) = 0 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_payload');
  end if;

  -- Verrouille la ligne le temps de la transaction
  select * into v_member
    from public.founder_members
   where user_id = v_user
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no_slot');
  end if;

  if v_member.completed_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'already_done');
  end if;

  v_deadline := v_member.joined_at + interval '30 days';
  if now() > v_deadline then
    update public.founder_members
       set status = 'expired'
     where user_id = v_user;
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;

  -- Insert idempotent malgré la contrainte UNIQUE (already_done couvre ce cas avant)
  insert into public.founder_questionnaire_responses
    (user_id, slot, usage, nps, frustration, top_feature, pricing)
  values
    (v_user, v_member.slot, p_usage, p_nps, p_frustration, p_top_feature, p_pricing);

  update public.founder_members
     set status           = 'completed',
         completed_at     = now(),
         premium_lifetime = true,
         badge            = true
   where user_id = v_user;

  -- Mirror dans profiles pour que limits.ts puisse calculer effectivePlan en 1 select
  update public.profiles
     set founder_premium_lifetime = true,
         founder_badge            = true,
         updated_at               = now()
   where id = v_user;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_founder_questionnaire(text, int, text, text, text) from public;
grant execute on function public.submit_founder_questionnaire(text, int, text, text, text) to authenticated;

comment on function public.submit_founder_questionnaire(text, int, text, text, text) is
  'Enregistre le questionnaire fondateur et débloque le Premium à vie + badge (transaction unique). SECURITY DEFINER.';

-- ---------------------------------------------------------------------
-- 7. Constantes exposées en SQL (source de vérité)
-- ---------------------------------------------------------------------
create or replace function public.founder_program_config()
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'founderLimit', 100,
    'questionnaireWindowDays', 30,
    'reminderDay', 20
  );
$$;

grant execute on function public.founder_program_config() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 7b. Compteur public : nombre de places déjà prises (utile en marketing)
--     Lecture seule, exposée à anon — ne révèle aucune info personnelle.
-- ---------------------------------------------------------------------
create or replace function public.founder_slots_taken()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.founder_members;
$$;

grant execute on function public.founder_slots_taken() to anon, authenticated;

comment on function public.founder_slots_taken() is
  'Renvoie le nombre de places fondateurs déjà attribuées (public, agrégé, sans PII).';

-- ---------------------------------------------------------------------
-- 8. Index utiles (lectures par statut, classements)
-- ---------------------------------------------------------------------
create index if not exists founder_members_status_idx
  on public.founder_members (status);

create index if not exists founder_members_joined_at_idx
  on public.founder_members (joined_at);
