-- ============================================================================
-- Migration : rattrapage des profiles manquants + trigger handle_new_user
--             robuste (n'empêche jamais une inscription d'aboutir)
-- ============================================================================
--
-- Contexte :
--   Certains comptes ont été créés sans qu'une ligne ne soit insérée dans
--   public.profiles (trigger absent au moment de l'inscription, ou plantage
--   silencieux). Conséquence : tous les UPDATE qui ciblent profiles via
--   `where id = userId` n'affectent aucune ligne et tout le flux billing
--   (checkout / webhook Mollie / sync) reste cassé pour ces utilisateurs.
--
-- Cette migration corrige le passé ET le futur :
--   1. Insère un profil pour TOUS les utilisateurs auth.users qui n'en ont
--      pas, en récupérant leur email.
--   2. Recrée la fonction handle_new_user avec un bloc EXCEPTION pour ne
--      jamais bloquer une inscription si l'insert échoue (RLS, contrainte,
--      etc.). L'erreur est loguée côté Postgres mais le NEW est retourné.
-- ============================================================================

-- 1. Backfill des profils manquants
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and u.email is not null
on conflict (id) do nothing;

-- 2. Trigger renforcé : n'empêche jamais l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.profiles (id, email)
    values (new.id, coalesce(new.email, ''))
    on conflict (id)
    do update set email = excluded.email, updated_at = now();
  exception when others then
    -- On loggue mais on ne propage pas : une inscription doit toujours réussir,
    -- les routes API (checkout/webhook/sync) appellent ensureProfile() en
    -- filet de sécurité de toute façon.
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

-- Le trigger est déjà créé dans schema.sql, on ne le recrée pas pour éviter
-- les conflits. Si vous repartez d'une DB vide, schema.sql contient déjà
-- la déclaration du trigger qui appellera cette nouvelle version de la
-- fonction.
