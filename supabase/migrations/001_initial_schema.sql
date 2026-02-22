-- =============================================================
-- bee-doo Kunden-Portal – Supabase Schema
-- Migration: 001_initial_schema
-- =============================================================

-- ─── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- CUSTOMERS
-- Verknüpft mit auth.users via user_id (Magic Link)
-- =============================================================
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_number TEXT UNIQUE NOT NULL,            -- z.B. BDO-2024-4821
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  street          TEXT,
  zip             TEXT,
  city            TEXT,
  referral_code   TEXT UNIQUE DEFAULT upper(substr(gen_random_uuid()::text, 1, 8)),
  referred_by     UUID REFERENCES customers(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- PROJECTS
-- Eine Anlage pro Auftrag (1:1 mit Customers in Phase 1)
-- =============================================================
CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_number    TEXT UNIQUE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'consultation'
                    CHECK (status IN (
                      'consultation','contract','grid_application',
                      'installation','commissioning','feed_in','completed'
                    )),
  -- Anlagendaten
  capacity_kwp      NUMERIC(6,2),
  storage_kwh       NUMERIC(6,2),
  module_count      INT,
  module_model      TEXT,
  inverter_model    TEXT,
  orientation       TEXT,
  annual_yield_kwh  INT,
  -- Finanzen
  total_price_gross NUMERIC(10,2),
  deposit_paid      NUMERIC(10,2),
  -- Termine
  consultation_date DATE,
  contract_date     DATE,
  installation_date DATE,
  commissioning_date DATE,
  -- Monitoring-Quelle
  enpal_system_id   TEXT,           -- für Enpal-API
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- MILESTONES
-- Dynamische Projektphasen mit optionalen Notizen
-- =============================================================
CREATE TABLE milestones (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,        -- 'consultation','contract','grid_application','installation','commissioning','feed_in'
  title        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','active','done')),
  planned_date DATE,
  done_date    DATE,
  note         TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, key)
);

-- =============================================================
-- DOCUMENTS
-- Supabase Storage Referenzen
-- =============================================================
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category     TEXT NOT NULL
               CHECK (category IN (
                 'offer','contract','grid_application','installation_protocol',
                 'commissioning_protocol','feed_in_confirmation','warranty','other'
               )),
  file_name    TEXT NOT NULL,
  storage_path TEXT NOT NULL,        -- Supabase Storage Bucket Path
  mime_type    TEXT,
  file_size    BIGINT,               -- bytes
  uploaded_at  TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- MONITORING DATA
-- Monatliche Aggregation (täglich via Edge Function befüllt)
-- =============================================================
CREATE TABLE monitoring_monthly (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  month           DATE NOT NULL,              -- erster des Monats
  production_kwh  NUMERIC(8,2) NOT NULL DEFAULT 0,
  feed_in_kwh     NUMERIC(8,2) NOT NULL DEFAULT 0,
  self_use_kwh    NUMERIC(8,2) NOT NULL DEFAULT 0,
  co2_saved_kg    NUMERIC(8,2) GENERATED ALWAYS AS (production_kwh * 0.6) STORED,
  revenue_eur     NUMERIC(8,2),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, month)
);

-- Tägliche Daten (für spätere Detail-Ansicht)
CREATE TABLE monitoring_daily (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  day             DATE NOT NULL,
  production_kwh  NUMERIC(7,3) NOT NULL DEFAULT 0,
  feed_in_kwh     NUMERIC(7,3),
  self_use_kwh    NUMERIC(7,3),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, day)
);

-- =============================================================
-- REFERRALS
-- Tracking wer wen geworben hat
-- =============================================================
CREATE TABLE referrals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id      UUID NOT NULL REFERENCES customers(id),
  referred_email   TEXT NOT NULL,
  referred_customer UUID REFERENCES customers(id),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','converted','bonus_paid')),
  bonus_amount     NUMERIC(8,2) DEFAULT 250.00,
  converted_at     TIMESTAMPTZ,
  bonus_paid_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- NPS RESPONSES
-- =============================================================
CREATE TABLE nps_responses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id  UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  score        INT NOT NULL CHECK (score >= 0 AND score <= 10),
  comment      TEXT,
  trigger      TEXT DEFAULT 'portal',   -- 'portal','post_installation','6months'
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- PORTAL NOTIFICATIONS
-- Benachrichtigungen im Portal anzeigen
-- =============================================================
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id  UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT,
  type         TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','action')),
  read_at      TIMESTAMPTZ,
  action_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- UPDATED_AT TRIGGER
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_milestones_updated
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- VIEWS
-- =============================================================

-- Kompletter Kunden-Snapshot für das Portal
CREATE OR REPLACE VIEW v_customer_portal AS
SELECT
  c.id                AS customer_id,
  c.user_id,
  c.customer_number,
  c.first_name,
  c.last_name,
  c.email,
  c.referral_code,
  p.id                AS project_id,
  p.project_number,
  p.status            AS project_status,
  p.capacity_kwp,
  p.storage_kwh,
  p.module_count,
  p.module_model,
  p.inverter_model,
  p.orientation,
  p.annual_yield_kwh,
  p.installation_date,
  p.commissioning_date,
  -- Monitoring-Aggregat
  COALESCE(m.total_kwh,   0) AS total_kwh,
  COALESCE(m.total_co2,   0) AS total_co2_kg,
  COALESCE(m.total_revenue, 0) AS total_revenue_eur,
  -- Referrals
  COALESCE(r.referral_count, 0) AS referral_count,
  COALESCE(r.bonus_total, 0)    AS referral_bonus_total
FROM customers c
LEFT JOIN projects p ON p.customer_id = c.id
LEFT JOIN (
  SELECT project_id,
    SUM(production_kwh) AS total_kwh,
    SUM(co2_saved_kg)   AS total_co2,
    SUM(revenue_eur)    AS total_revenue
  FROM monitoring_monthly GROUP BY project_id
) m ON m.project_id = p.id
LEFT JOIN (
  SELECT referrer_id,
    COUNT(*) AS referral_count,
    SUM(CASE WHEN status IN ('converted','bonus_paid') THEN bonus_amount ELSE 0 END) AS bonus_total
  FROM referrals GROUP BY referrer_id
) r ON r.referrer_id = c.id;

-- =============================================================
-- ROW LEVEL SECURITY
-- Kunden sehen NUR ihre eigenen Daten
-- =============================================================
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_monthly  ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_daily    ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- Helper: customer_id aus auth.uid()
CREATE OR REPLACE FUNCTION my_customer_id()
RETURNS UUID AS $$
  SELECT id FROM customers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION my_project_id()
RETURNS UUID AS $$
  SELECT p.id FROM projects p
  JOIN customers c ON c.id = p.customer_id
  WHERE c.user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- POLICIES
CREATE POLICY "customers: own row" ON customers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "projects: own project" ON projects
  FOR ALL USING (customer_id = my_customer_id());

CREATE POLICY "milestones: own project" ON milestones
  FOR ALL USING (project_id = my_project_id());

CREATE POLICY "documents: own project" ON documents
  FOR SELECT USING (project_id = my_project_id());

CREATE POLICY "monitoring_monthly: own" ON monitoring_monthly
  FOR SELECT USING (project_id = my_project_id());

CREATE POLICY "monitoring_daily: own" ON monitoring_daily
  FOR SELECT USING (project_id = my_project_id());

CREATE POLICY "referrals: own" ON referrals
  FOR SELECT USING (referrer_id = my_customer_id());

CREATE POLICY "nps: own" ON nps_responses
  FOR ALL USING (customer_id = my_customer_id());

CREATE POLICY "notifications: own" ON notifications
  FOR ALL USING (customer_id = my_customer_id());

-- SERVICE ROLE (internes Dashboard / Edge Functions) hat vollen Zugriff via BYPASSRLS

-- =============================================================
-- SEED: Standard-Milestones als Funktion
-- Beim Anlegen eines neuen Projekts aufrufen
-- =============================================================
CREATE OR REPLACE FUNCTION seed_milestones(p_project_id UUID)
RETURNS VOID AS $$
INSERT INTO milestones (project_id, key, title, sort_order) VALUES
  (p_project_id, 'consultation',      'Beratungsgespräch',          1),
  (p_project_id, 'contract',          'Angebot & Vertrag',           2),
  (p_project_id, 'grid_application',  'Netzanmeldung',               3),
  (p_project_id, 'installation',      'Installation',                4),
  (p_project_id, 'commissioning',     'Inbetriebnahme & Abnahme',    5),
  (p_project_id, 'feed_in',           'Einspeisebestätigung',        6);
$$ LANGUAGE sql;

-- Trigger: Milestones automatisch beim neuen Projekt anlegen
CREATE OR REPLACE FUNCTION auto_seed_milestones()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM seed_milestones(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_milestones
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION auto_seed_milestones();
