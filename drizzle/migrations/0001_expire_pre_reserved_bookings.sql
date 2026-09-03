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
           cancelled_at = now(),
           cancelled_by = 'system',
           updated_at = now()
     WHERE status IN ('pending'::booking_status, 'approved'::booking_status)
       AND payment_status IN ('unpaid'::payment_status, 'deposit_pending'::payment_status)
       AND payment_deadline IS NOT NULL
       AND payment_deadline < now()
     RETURNING 1
  )
  SELECT count(*) INTO affected FROM expired;
  RETURN affected;
END;
$function$;