/*
# Create shield database tables for Adversarial Prompt Injection Auto-Shield

## Overview
Creates three tables to persist the dashboard's security telemetry data,
replacing the previous browser-only localStorage approach with a durable
Supabase backend. This is a single-tenant application with no sign-in screen,
so all policies are open to both anon and authenticated roles.

## New Tables

### 1. threat_events
Stores every threat event detected by the shield — injection attempts,
drift spikes, sandbox scans, and system events.
- `id` (text, primary key) — client-generated unique ID
- `timestamp` (bigint, not null) — epoch milliseconds
- `type` (text, not null) — event type: injection | drift | sandbox | system
- `severity` (text, not null) — critical | high | medium | low | info
- `status` (text, not null) — blocked | quarantined | allowed | analyzing
- `source` (text, not null) — originating subsystem name
- `threat_score` (integer, not null) — 0-100 risk score
- `description` (text, not null) — short summary
- `details` (text, not null) — extended description
- `flagged_phrases` (text[], default '{}') — array of matched attack phrases
- `technique_breakdown` (jsonb, default '[]') — per-technique score breakdown
- `input_text` (text, nullable) — original analyzed prompt (if applicable)
- `drift_vector` (jsonb, nullable) — semantic drift vector dimensions
- `created_at` (timestamptz, default now()) — database insert time

### 2. quarantined_items
Stores prompts that were quarantined by the sandbox (threat score 35-69)
for later review, release, or dismissal.
- `id` (text, primary key) — client-generated unique ID
- `input_text` (text, not null) — the quarantined prompt
- `threat_score` (integer, not null) — 0-100 risk score
- `technique_breakdown` (jsonb, default '[]') — matched technique details
- `flagged_phrases` (text[], default '{}') — flagged attack phrases
- `quarantined_at` (bigint, not null) — epoch milliseconds
- `released` (boolean, default false) — whether item was released from quarantine
- `created_at` (timestamptz, default now()) — database insert time

### 3. drift_history
Stores semantic vector drift snapshots over time for the drift trend chart.
- `id` (text, primary key) — client-generated unique ID
- `timestamp` (bigint, not null) — epoch milliseconds
- `overall` (integer, not null) — overall drift score 0-100
- `intent` (integer, not null) — intent drift dimension
- `instruction_override` (integer, not null) — override drift dimension
- `data_extraction` (integer, not null) — extraction drift dimension
- `role_hijack` (integer, not null) — hijack drift dimension
- `encoding_evasion` (integer, not null) — encoding drift dimension
- `created_at` (timestamptz, default now()) — database insert time

## Security
- RLS enabled on all three tables.
- All policies use `TO anon, authenticated` since this is a single-tenant
  no-auth app — the frontend uses the anon key and has no sign-in screen.
- `USING (true)` is intentional: the data is shared/public within this
  single-tenant application.

## Indexes
- `threat_events.timestamp` — frequent time-range queries and sorting
- `threat_events.severity` — filter by severity level
- `threat_events.type` — filter by event type
- `threat_events.status` — filter by threat status
- `quarantined_items.quarantined_at` — sort by quarantine time
- `drift_history.timestamp` — time-series ordering
*/

-- ─── threat_events ───
CREATE TABLE IF NOT EXISTS threat_events (
  id text PRIMARY KEY,
  timestamp bigint NOT NULL,
  type text NOT NULL CHECK (type IN ('injection', 'drift', 'sandbox', 'system')),
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  status text NOT NULL CHECK (status IN ('blocked', 'quarantined', 'allowed', 'analyzing')),
  source text NOT NULL,
  threat_score integer NOT NULL DEFAULT 0,
  description text NOT NULL,
  details text NOT NULL DEFAULT '',
  flagged_phrases text[] NOT NULL DEFAULT '{}',
  technique_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  input_text text,
  drift_vector jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE threat_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp ON threat_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_threat_events_severity ON threat_events (severity);
CREATE INDEX IF NOT EXISTS idx_threat_events_type ON threat_events (type);
CREATE INDEX IF NOT EXISTS idx_threat_events_status ON threat_events (status);

DROP POLICY IF EXISTS "anon_select_threat_events" ON threat_events;
CREATE POLICY "anon_select_threat_events"
  ON threat_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_threat_events" ON threat_events;
CREATE POLICY "anon_insert_threat_events"
  ON threat_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_threat_events" ON threat_events;
CREATE POLICY "anon_update_threat_events"
  ON threat_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_threat_events" ON threat_events;
CREATE POLICY "anon_delete_threat_events"
  ON threat_events FOR DELETE
  TO anon, authenticated USING (true);

-- ─── quarantined_items ───
CREATE TABLE IF NOT EXISTS quarantined_items (
  id text PRIMARY KEY,
  input_text text NOT NULL,
  threat_score integer NOT NULL DEFAULT 0,
  technique_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  flagged_phrases text[] NOT NULL DEFAULT '{}',
  quarantined_at bigint NOT NULL,
  released boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quarantined_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quarantined_items_quarantined_at ON quarantined_items (quarantined_at DESC);

DROP POLICY IF EXISTS "anon_select_quarantined_items" ON quarantined_items;
CREATE POLICY "anon_select_quarantined_items"
  ON quarantined_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quarantined_items" ON quarantined_items;
CREATE POLICY "anon_insert_quarantined_items"
  ON quarantined_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quarantined_items" ON quarantined_items;
CREATE POLICY "anon_update_quarantined_items"
  ON quarantined_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quarantined_items" ON quarantined_items;
CREATE POLICY "anon_delete_quarantined_items"
  ON quarantined_items FOR DELETE
  TO anon, authenticated USING (true);

-- ─── drift_history ───
CREATE TABLE IF NOT EXISTS drift_history (
  id text PRIMARY KEY,
  timestamp bigint NOT NULL,
  overall integer NOT NULL DEFAULT 0,
  intent integer NOT NULL DEFAULT 0,
  instruction_override integer NOT NULL DEFAULT 0,
  data_extraction integer NOT NULL DEFAULT 0,
  role_hijack integer NOT NULL DEFAULT 0,
  encoding_evasion integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE drift_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_drift_history_timestamp ON drift_history (timestamp DESC);

DROP POLICY IF EXISTS "anon_select_drift_history" ON drift_history;
CREATE POLICY "anon_select_drift_history"
  ON drift_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_drift_history" ON drift_history;
CREATE POLICY "anon_insert_drift_history"
  ON drift_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_drift_history" ON drift_history;
CREATE POLICY "anon_delete_drift_history"
  ON drift_history FOR DELETE
  TO anon, authenticated USING (true);
