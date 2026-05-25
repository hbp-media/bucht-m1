
-- 1. Restrict bank details on payment_settings
DROP POLICY IF EXISTS "Anyone authenticated can read payment settings" ON public.payment_settings;

-- Non-admin authenticated users can read non-sensitive payment settings via a view
CREATE OR REPLACE VIEW public.payment_settings_public
WITH (security_invoker = true) AS
SELECT id, deposit_percent, cancellation_days_before, full_payment_days_before,
       deposit_deadline_hours, contact_email, contact_phone, created_at, updated_at
FROM public.payment_settings;

GRANT SELECT ON public.payment_settings_public TO authenticated, anon;

-- Allow authenticated users to read the (already non-sensitive) view; full table restricted to admins
CREATE POLICY "Admins can read full payment settings"
ON public.payment_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Explicit deny INSERT for non-admins on user_roles (defensive — ALL policy already restricts, but make INSERT explicit)
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Realtime authorization: restrict who can subscribe to which channels
-- Enable RLS on realtime.messages (already enabled by Supabase but ensure)
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own notif channel" ON realtime.messages;
CREATE POLICY "Users can subscribe to own notif channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() = 'notif-' || auth.uid()::text)
  OR (realtime.topic() = 'admin-bookings-rt' AND has_role(auth.uid(), 'admin'::app_role))
);
