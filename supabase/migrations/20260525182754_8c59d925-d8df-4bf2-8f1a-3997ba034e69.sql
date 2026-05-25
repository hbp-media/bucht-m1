
CREATE OR REPLACE FUNCTION public.get_payment_bank_details()
RETURNS TABLE(bank_holder text, iban text, bic text, deposit_deadline_hours int, cancellation_days_before int)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF has_role(auth.uid(), 'admin'::app_role)
     OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.user_id = auth.uid() AND b.cancelled_at IS NULL) THEN
    RETURN QUERY
      SELECT ps.bank_holder, ps.iban, ps.bic, ps.deposit_deadline_hours, ps.cancellation_days_before
      FROM public.payment_settings ps
      LIMIT 1;
  ELSE
    RETURN QUERY
      SELECT ''::text, ''::text, ''::text, ps.deposit_deadline_hours, ps.cancellation_days_before
      FROM public.payment_settings ps
      LIMIT 1;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_payment_bank_details() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_payment_bank_details() TO authenticated;
