-- ============================================================================
-- Suppression individuelle des notifications (inbox)
-- ----------------------------------------------------------------------------
-- N1 révoquait DELETE pour authenticated. L'inbox a besoin d'une suppression
-- persistée, limitée au propriétaire (auth.uid() = user_id).
-- INSERT / UPDATE restent révoqués ; la lecture se fait toujours via RPC.
-- Distinct de notification_log : aucun impact sur les Push déjà envoyés.
-- ============================================================================

grant delete on public.notifications to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_delete_own'
  ) then
    create policy notifications_delete_own
      on public.notifications
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;
