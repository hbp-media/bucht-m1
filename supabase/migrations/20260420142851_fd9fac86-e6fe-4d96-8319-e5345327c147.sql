-- Trigger: verhindert überlappende Buchungen (pending/approved/paid) für denselben Spot
-- sowie Konflikte mit blocked_dates.

CREATE OR REPLACE FUNCTION public.prevent_booking_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflict_count integer;
  blocked_count integer;
BEGIN
  -- Nur aktive Buchungs-Status berücksichtigen
  IF NEW.status NOT IN ('pending', 'approved', 'paid') THEN
    RETURN NEW;
  END IF;

  -- Überlappung mit anderen Buchungen am selben Spot prüfen
  SELECT COUNT(*) INTO conflict_count
  FROM public.bookings
  WHERE spot_id = NEW.spot_id
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND status IN ('pending', 'approved', 'paid')
    AND daterange(start_date, end_date, '[]') && daterange(NEW.start_date, NEW.end_date, '[]');

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Dieser Platz ist im gewählten Zeitraum bereits reserviert.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Konflikt mit blocked_dates prüfen
  SELECT COUNT(*) INTO blocked_count
  FROM public.blocked_dates
  WHERE spot_id = NEW.spot_id
    AND date >= NEW.start_date
    AND date <= NEW.end_date;

  IF blocked_count > 0 THEN
    RAISE EXCEPTION 'Mindestens ein Tag im gewählten Zeitraum ist gesperrt.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_prevent_overlap ON public.bookings;
CREATE TRIGGER bookings_prevent_overlap
BEFORE INSERT OR UPDATE OF start_date, end_date, spot_id, status ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_booking_overlap();

-- Index für schnelle Überlappungsabfragen
CREATE INDEX IF NOT EXISTS bookings_spot_dates_status_idx
  ON public.bookings (spot_id, start_date, end_date, status);