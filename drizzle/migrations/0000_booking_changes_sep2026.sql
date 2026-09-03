-- Buchungsnummer
CREATE SEQUENCE IF NOT EXISTS public.booking_number_seq START 1;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_number text,
  ADD COLUMN IF NOT EXISTS fishing_fee_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS solo_surcharge_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS companions_kids integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by_admin boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_booking_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := 'BM1-' || lpad(nextval('public.booking_number_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_set_number ON public.bookings;
CREATE TRIGGER bookings_set_number
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_booking_number();

-- Bestandsbuchungen nachziehen
UPDATE public.bookings
   SET booking_number = 'BM1-' || lpad(nextval('public.booking_number_seq')::text, 3, '0')
 WHERE booking_number IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_booking_number_key ON public.bookings (booking_number);

-- Platz-Ausstattung
ALTER TABLE public.fishing_spots
  ADD COLUMN IF NOT EXISTS amenities text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS allow_companions boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS bunk_beds boolean NOT NULL DEFAULT true;

-- Zahlungsfrist 7 Tage
ALTER TABLE public.payment_settings
  ALTER COLUMN deposit_deadline_hours SET DEFAULT 168;
