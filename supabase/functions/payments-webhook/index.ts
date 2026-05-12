// Paddle webhook handler: marks booking paid + approved on transaction.completed,
// or marks payment_status=failed on transaction.payment_failed.
// Both sandbox and live point here with ?env=sandbox|live.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }
  return _supabase;
}

async function handleTransactionCompleted(data: any) {
  const bookingId = data.customData?.bookingId ?? data.custom_data?.bookingId;
  if (!bookingId) {
    console.warn('transaction.completed without bookingId', data.id);
    return;
  }
  const { error } = await getSupabase()
    .from('bookings')
    .update({
      status: 'approved',
      payment_status: 'paid',
      paddle_transaction_id: data.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);
  if (error) console.error('booking update failed', error);

  // Send confirmation emails (admin_new for staff + approved for customer)
  try {
    const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-email`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    };
    await Promise.all([
      fetch(url, { method: 'POST', headers, body: JSON.stringify({ type: 'admin_new', booking_id: bookingId }) }),
      fetch(url, { method: 'POST', headers, body: JSON.stringify({ type: 'approved', booking_id: bookingId }) }),
    ]);
  } catch (e) {
    console.error('booking notification failed', e);
  }
}

async function handleTransactionFailed(data: any) {
  const bookingId = data.customData?.bookingId ?? data.custom_data?.bookingId;
  if (!bookingId) return;
  await getSupabase()
    .from('bookings')
    .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', bookingId);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;

  try {
    const event = await verifyWebhook(req, env);
    switch (event.eventType) {
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data);
        break;
      case EventName.TransactionPaymentFailed:
        await handleTransactionFailed(event.data);
        break;
      default:
        console.log('Unhandled event', event.eventType);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('webhook error', e);
    return new Response('Webhook error', { status: 400 });
  }
});
