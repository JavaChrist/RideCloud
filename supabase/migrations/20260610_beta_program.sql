-- Migration : programme bêta testeurs
-- À appliquer via le dashboard Supabase > SQL Editor

-- 1. Colonnes bêta sur profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS beta_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS beta_feedback_submitted boolean NOT NULL DEFAULT false;

-- 2. Table des codes d'invitation (100 max)
CREATE TABLE IF NOT EXISTS invite_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text UNIQUE NOT NULL,
  used_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seul le service role peut lire/écrire cette table
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON invite_codes
  USING (false)
  WITH CHECK (false);

-- 3. Table des retours d'expérience bêta
CREATE TABLE IF NOT EXISTS beta_feedback (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submitted_at         timestamptz NOT NULL DEFAULT now(),
  overall_rating       smallint NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  ease_of_use          smallint NOT NULL CHECK (ease_of_use BETWEEN 1 AND 5),
  most_useful_feature  text NOT NULL,
  improvements         text NOT NULL,
  would_recommend      boolean NOT NULL,
  would_pay            text NOT NULL CHECK (would_pay IN ('yes_current', 'yes_cheaper', 'no')),
  additional_comments  text
);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- L'utilisateur peut insérer son propre feedback (une seule fois via la contrainte unique)
CREATE UNIQUE INDEX IF NOT EXISTS beta_feedback_user_unique ON beta_feedback(user_id);

CREATE POLICY "Users insert own feedback" ON beta_feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own feedback" ON beta_feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
