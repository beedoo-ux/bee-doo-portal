-- =============================================================
-- Migration: 002_whatsapp_and_reviews
-- WhatsApp Notification Log + Trustpilot Cache
-- =============================================================

-- ─── WhatsApp Notification Log ────────────────────────────────
CREATE TABLE whatsapp_notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id  UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id),
  phone        TEXT NOT NULL,
  message      TEXT NOT NULL,
  trigger      TEXT NOT NULL,          -- 'milestone_update','appointment_reminder','document_ready'
  milestone_key TEXT,
  twilio_sid   TEXT,                   -- Twilio Message SID zur Nachverfolgung
  status       TEXT DEFAULT 'pending'  -- 'pending','sent','delivered','failed'
               CHECK (status IN ('pending','sent','delivered','failed')),
  sent_at      TIMESTAMPTZ,
  error        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE whatsapp_notifications ENABLE ROW LEVEL SECURITY;
-- Kunden können ihre eigenen Nachrichten sehen
CREATE POLICY "whatsapp: own" ON whatsapp_notifications
  FOR SELECT USING (customer_id = my_customer_id());

-- ─── Trustpilot Reviews Cache ──────────────────────────────────
-- Reviews werden täglich via API gecacht, Kunden sehen nur 4-5 Sterne
CREATE TABLE trustpilot_reviews (
  id              TEXT PRIMARY KEY,    -- Trustpilot Review ID
  stars           INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  title           TEXT,
  text            TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  author_location TEXT,
  created_at_tp   TIMESTAMPTZ NOT NULL,  -- Datum der TP-Rezension
  response        TEXT,                  -- Antwort von bee-doo
  cached_at       TIMESTAMPTZ DEFAULT now(),
  is_visible      BOOLEAN DEFAULT true   -- manuell ausblendbar
);

-- Kein RLS nötig – public read
-- ─── Index ────────────────────────────────────────────────────
CREATE INDEX idx_tp_reviews_stars ON trustpilot_reviews(stars DESC);
CREATE INDEX idx_tp_reviews_date  ON trustpilot_reviews(created_at_tp DESC);
CREATE INDEX idx_wa_customer      ON whatsapp_notifications(customer_id, created_at DESC);

-- ─── WhatsApp Trigger: Bei Milestone-Update automatisch senden ─
-- Diese Funktion wird aus der Next.js API aufgerufen (kein DB-Trigger
-- da Twilio-HTTP-Call aus DB heraus nicht möglich ist)
-- Die App-Logik: Beim PATCH milestone.status → API Route → Twilio → Log
