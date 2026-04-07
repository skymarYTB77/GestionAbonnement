/*
  # Fix RLS policies

  Les politiques RLS actuelles utilisent USING et WITH CHECK qui ne permettent pas
  les accès publics correctement. On va les recréer avec une meilleure approche.
  
  1. Supprimer les anciennes politiques problématiques
  2. Créer de nouvelles politiques qui permettent l'accès public (app sans authentification)
*/

DROP POLICY IF EXISTS "Allow all access to subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all access to free_trials" ON free_trials;

CREATE POLICY "subscriptions_public_select"
  ON subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "subscriptions_public_insert"
  ON subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "subscriptions_public_update"
  ON subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "subscriptions_public_delete"
  ON subscriptions
  FOR DELETE
  USING (true);

CREATE POLICY "free_trials_public_select"
  ON free_trials
  FOR SELECT
  USING (true);

CREATE POLICY "free_trials_public_insert"
  ON free_trials
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "free_trials_public_update"
  ON free_trials
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "free_trials_public_delete"
  ON free_trials
  FOR DELETE
  USING (true);
