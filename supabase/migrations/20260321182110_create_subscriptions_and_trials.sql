/*
  # Création des tables pour la gestion d'abonnements

  1. Nouvelles Tables
    - `subscriptions` : Abonnements payants
      - `id` (uuid, primary key)
      - `name` (text) : Nom de l'abonnement
      - `price` (numeric) : Prix
      - `frequency` (text) : mensuel ou annuel
      - `billing_date` (integer) : Jour du mois (1-31)
      - `email` (text) : Email utilisé
      - `link` (text) : Lien vers le site
      - `status` (text) : actif ou annulé
      - `notes` (text) : Notes
      - `created_at` (timestamptz) : Date de création
      
    - `free_trials` : Essais gratuits
      - `id` (uuid, primary key)
      - `name` (text) : Nom du service
      - `email` (text) : Email utilisé (obligatoire)
      - `password` (text) : Mot de passe
      - `identifier` (text) : Identifiant
      - `link` (text) : Lien vers le site
      - `start_date` (date) : Date de début
      - `end_date` (date) : Date de fin
      - `cancel_date` (date) : Date d'annulation (auto = fin - 1 jour)
      - `card_used` (text) : Carte utilisée
      - `status` (text) : actif ou annulé
      - `notes` (text) : Notes
      - `created_at` (timestamptz) : Date de création

  2. Sécurité
    - Enable RLS sur les deux tables
    - Pas d'authentification requise pour cette app simple
    - Politique permettant tout accès (app personnelle)
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  frequency text NOT NULL DEFAULT 'mensuel',
  billing_date integer NOT NULL,
  email text,
  link text,
  status text NOT NULL DEFAULT 'actif',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS free_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  password text,
  identifier text,
  link text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cancel_date date,
  card_used text,
  status text NOT NULL DEFAULT 'actif',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to subscriptions"
  ON subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to free_trials"
  ON free_trials
  FOR ALL
  USING (true)
  WITH CHECK (true);