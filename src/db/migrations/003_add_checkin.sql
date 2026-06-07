-- ============================================================
--  003_add_checkin.sql — Add check-in tracking to tickets
--  Run this in Supabase SQL editor to enable gate check-in.
-- ============================================================

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL;

-- A NULL checked_in_at means not yet checked in.
-- Once set, the attendee is considered checked in and cannot check in again.
