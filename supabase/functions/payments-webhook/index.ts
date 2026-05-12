// Paddle webhook: transaction.completed → Buchung als bezahlt+bestätigt;
// transaction.payment_failed → payment_status=failed;
// adjustment.created (action=refund) → Buchung als rejected/refunded (Spot frei).

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

async function dispatchEmail(type: string, bookingId: string) {
  try {
    const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-email`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    };
    await fetch(url, { method: 'POST', headers, body: JSON.stringify({ type, booking_id: bookingId }) });
  } catch (e) {
    console.error('email dispatch failed', type, e);
  }
}

async function handleTransactionCompleted(data: any) {
  const bookingId = data.customData?.bookingId ?? data.custom_data?.bookingId;
  if (!bookingId) {
    console.warn('transaction.completed without bookingId', data.id);
    return;
  }
  const { data: existing } = await getSupabase()
    .from('bookings')
    .select('status, payment_status')
    .eq('id', bookingId)
    .maybeSingle();
  // Idempotenz: bereits bezahlt → nichts tun
  if ((existing as any)?.payment_status === 'paid') return;

  const { error } = await getSupabase()
    .from('bookings')
    .update({
      status: 'paid',
      payment_status: 'paid',
      paddle_transaction_id: data.id,
      payment_deadline: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);
  if (error) console.error('booking update failed', error);

  await Promise.all([
    dispatchEmail('admin_new', bookingId), // optional Admin-Bestätigung "Zahlung eingegangen"
    dispatchEmail('paid', bookingId),
  ]);
}

async function handleTransactionFailed(data: any) {
  const bookingId = data.customData?.bookingId ?? data.custom_data?.bookingId;
  if (!bookingId) return;
  await getSupabase()
    .from('bookings')
    .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', bookingId);
}

async function handleAdjustmentCreated(data: any) {
  // Nur tatsächliche Refunds behandeln
  if (data.action !== 'refund') return;
  const txnId = data.transactionId ?? data.transaction_id;
  if (!txnId) return;

  const { data: booking } = await getSupabase()
    .from('bookings')
    .select('id, payment_status')
    .eq('paddle_transaction_id', txnId)
    .maybeSingle();
  if (!booking) {
    console.warn('refund without matching booking', txnId);
    return;
  }
  if ((booking as any).payment_status === 'refunded') return;

  await getSupabase()
    .from('bookings')
    .update({
      status: 'rejected',
      payment_status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', (booking as any).id);

  await dispatchEmail('refunded', (booking as any).id);
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
      case 'adjustment.created' as any:
        await handleAdjustmentCreated(event.data);
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
