
-- 1) Erweitere payment_status enum um failed und expired
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'failed';
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'expired';

-- 2) Spalte payment_deadline
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS payment_deadline timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_payment_deadline 
  ON public.bookings(payment_deadline) 
  WHERE payment_deadline IS NOT NULL;

-- 3) Eindeutigkeit für paddle_transaction_id (verhindert doppelte Webhooks)
DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT bookings_paddle_transaction_id_key UNIQUE (paddle_transaction_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
END $$;

-- 4) Cleanup-Funktion (SECURITY DEFINER, läuft als postgres)
CREATE OR REPLACE FUNCTION public.expire_unpaid_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  WITH expired AS (
    UPDATE public.bookings
       SET status = 'rejected'::booking_status,
           payment_status = 'expired'::payment_status,
           updated_at = now()
     WHERE status = 'approved'::booking_status
       AND payment_status = 'unpaid'::payment_status
       AND payment_deadline IS NOT NULL
       AND payment_deadline < now()
     RETURNING 1
  )
  SELECT count(*) INTO affected FROM expired;
  RETURN affected;
END;
$$;

-- 5) pg_cron einrichten und Job alle Minute
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-unpaid-bookings') THEN
    PERFORM cron.unschedule('expire-unpaid-bookings');
  END IF;
  PERFORM cron.schedule(
    'expire-unpaid-bookings',
    '* * * * *',
    $cron$ SELECT public.expire_unpaid_bookings(); $cron$
  );
END $$;
