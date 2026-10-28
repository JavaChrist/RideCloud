-- Horodatage d'envoi des invitations Family (renvoi sans doublon).
-- Non destructif : colonne additive, aucun droit modifié.

alter table public.household_invites
  add column if not exists last_email_sent_at timestamptz;

comment on column public.household_invites.last_email_sent_at is
  'Dernier envoi d''e-mail d''invitation. Sert à limiter les renvois, pas à accorder des droits.';
