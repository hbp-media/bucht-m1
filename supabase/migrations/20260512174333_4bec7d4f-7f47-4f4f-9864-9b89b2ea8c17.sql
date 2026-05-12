ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paddle_transaction_id text;
CREATE INDEX IF NOT EXISTS idx_bookings_paddle_txn ON public.bookings(paddle_transaction_id);