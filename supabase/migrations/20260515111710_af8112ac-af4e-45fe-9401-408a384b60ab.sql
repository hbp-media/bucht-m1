-- 1. Settings-Tabelle (single row)
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_holder text NOT NULL DEFAULT '',
  iban text NOT NULL DEFAULT '',
  bic text NOT NULL DEFAULT '',
  deposit_deadline_hours integer NOT NULL DEFAULT 24,
  full_payment_days_before integer NOT NULL DEFAULT 14,
  cancellation_days_before integer NOT NULL DEFAULT 14,
  deposit_percent integer NOT NULL DEFAULT 50,
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read payment settings"
  ON public.payment_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage payment settings"
  ON public.payment_settings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Default-Zeile einfügen
INSERT INTO public.payment_settings (bank_holder, iban, bic) VALUES ('', '', '');

-- 2. Bookings-Tabelle erweitern
ALTER TABLE public.bookings
  ADD COLUMN deposit_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN deposit_paid_at timestamptz,
  ADD COLUMN final_payment_due_date date,
  ADD COLUMN final_paid_at timestamptz,
  ADD COLUMN cancelled_at timestamptz;

-- 3. payment_status enum erweitern
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'deposit_pending';
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'deposit_paid';

-- 4. Cron-Funktion: jetzt für deposit_pending
CREATE OR REPLACE FUNCTION public.expire_unpaid_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected integer;
BEGIN
  WITH expired AS (
    UPDATE public.bookings
       SET status = 'rejected'::booking_status,
           payment_status = 'expired'::payment_status,
           updated_at = now()
     WHERE status = 'approved'::booking_status
       AND payment_status IN ('unpaid'::payment_status, 'deposit_pending'::payment_status)
       AND payment_deadline IS NOT NULL
       AND payment_deadline < now()
     RETURNING 1
  )
  SELECT count(*) INTO affected FROM expired;
  RETURN affected;
END;
$function$;