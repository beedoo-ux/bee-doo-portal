# bee-doo Kunden-Portal

Next.js 14 + Supabase Kunden-Portal für portal.bee-doo.de

## Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Supabase Magic Link (kein Passwort)
- **DB + Storage**: Supabase (bestehende Instanz)
- **Deploy**: Vercel → portal.bee-doo.de
- **Charts**: Recharts
- **Sprache**: TypeScript

## Setup

### 1. Repository klonen & Dependencies installieren

```bash
git clone <repo>
cd beedoo-portal
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Werte eintragen (Supabase URL + Anon Key)
```

### 3. Supabase Migration ausführen

Im Supabase Dashboard → SQL Editor:

```sql
-- Inhalt von supabase/migrations/001_initial_schema.sql einfügen und ausführen
```

Oder via Supabase CLI:
```bash
supabase db push
```

### 4. Supabase Storage Bucket anlegen

```
Bucket Name: project-documents
Access: Private (RLS)
```

### 5. Auth-Einstellungen in Supabase

- Authentication → URL Configuration
- Site URL: `https://portal.bee-doo.de`
- Redirect URLs: `https://portal.bee-doo.de/api/auth/callback`

### 6. Ersten Kunden anlegen

```sql
-- Neuen Kunden einfügen
INSERT INTO customers (customer_number, first_name, last_name, email, street, zip, city)
VALUES ('BDO-2024-4821', 'Max', 'Mustermann', 'max@mustermann.de', 'Musterstr. 12', '33602', 'Bielefeld');

-- Projekt anlegen (Milestones werden automatisch erstellt via Trigger)
INSERT INTO projects (customer_id, project_number, status, capacity_kwp, storage_kwh, ...)
VALUES ('<customer_id>', 'BDO-PRJ-0001', 'installation', 9.8, 10.0, ...);
```

Sobald der Kunde sich per Magic Link anmeldet, wird sein `user_id` automatisch mit dem `customers`-Record verknüpft – das passiert beim ersten Login manuell oder via Supabase Auth Hook.

## Lokale Entwicklung

```bash
npm run dev
# → http://localhost:3000
```

## Deploy auf Vercel

```bash
vercel --prod
# Domain in Vercel: portal.bee-doo.de
```

## Datenbankstruktur

```
customers          → Kundenstammdaten + Auth-Verknüpfung
projects           → Anlagendaten, Status, Termine
milestones         → Projektzeitlinie (auto-angelegt via Trigger)
documents          → Dateien in Supabase Storage
monitoring_monthly → Monatliche Ertragsdaten
monitoring_daily   → Tägliche Daten (für spätere Detail-Ansicht)
referrals          → Empfehlungs-Tracking
nps_responses      → Kundenzufriedenheit
notifications      → Portal-Benachrichtigungen

v_customer_portal  → View: Kompakter Snapshot für die Startseite
```

## Auth Flow (Magic Link)

1. Kunde gibt E-Mail ein → `/login`
2. Supabase sendet Magic Link
3. Klick auf Link → `/api/auth/callback` (Code-Exchange)
4. Session wird gesetzt → Redirect zu `/portal`
5. Middleware prüft Session bei jedem Request

## Roadmap

- [ ] Admin-Interface: Kunden anlegen, Milestones updaten, Dokumente hochladen
- [ ] Enpal-API Integration: Monitoring-Daten täglich via Edge Function syncen
- [ ] Push Notifications: Bei Milestone-Änderungen E-Mail versenden
- [ ] PDF-Rechnungsansicht inline
- [ ] Mehrsprachigkeit (DE/EN)
