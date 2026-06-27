// Cronjob-Endpoint: Storniert automatisch zwei Klassen von Buchungen.
//   1) Anzahlung nicht innerhalb der Frist überwiesen → payment_status='expired'
//   2) Anzahlung erhalten, aber Restzahlung vor Ort bis zum Check-in nicht erfolgt
//      → Buchung wird storniert, Anzahlung verfällt (payment_status bleibt 'deposit_paid',
//        cancelled_at gesetzt, status='rejected'), Kontingent wird freigegeben.
// Aufruf via pg_cron (alle 15 min). Sendet automatisch Storno-Mails an Kunden
// und benachrichtigt Admins via Notification, falls eine Restzahlungs-Stornierung erfolgt.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const nowIso = now.toISOString();
    const todayIso = nowIso.slice(0, 10); // YYYY-MM-DD

    const result: {
      deposit_expired: string[];
      onsite_no_show: string[];
    } = { deposit_expired: [], onsite_no_show: [] };

    // ─── 1) Anzahlungs-Frist abgelaufen ───────────────────────────────────────
    const { data: depExpired, error: depErr } = await admin
      .from('bookings')
      .select('id')
      .in('status', ['pending', 'approved'])
      .in('payment_status', ['unpaid', 'deposit_pending'])
      .not('payment_deadline', 'is', null)
      .lt('payment_deadline', nowIso);

    if (depErr) throw depErr;

    if (depExpired && depExpired.length) {
      const ids = depExpired.map((b) => b.id);
      const { error: updErr } = await admin
        .from('bookings')
        .update({
          status: 'rejected',
          payment_status: 'expired',
          cancelled_at: nowIso,
          cancelled_by: 'system',
        })
        .in('id', ids);
      if (updErr) throw updErr;
      result.deposit_expired = ids;

      await Promise.all(
        ids.map((id) =>
          fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
            body: JSON.stringify({ type: 'payment_expired', booking_id: id }),
          }).catch((e) => console.error('mail (deposit_expired) failed', id, e)),
        ),
      );
    }

    // ─── 2) Restzahlung vor Ort (Check-in) nicht erfolgt ─────────────────────
    //   Bedingung: status='approved', payment_status='deposit_paid',
    //              final_paid_at IS NULL, start_date < heute (Check-in vorbei).
    //   Anzahlung verfällt (kein Refund), Kontingent wird freigegeben.
    const { data: noShow, error: nsErr } = await admin
      .from('bookings')
      .select('id, user_id, first_name, deposit_amount, start_date, spot_id')
      .eq('status', 'approved')
      .eq('payment_status', 'deposit_paid')
      .is('final_paid_at', null)
      .lt('start_date', todayIso);

    if (nsErr) throw nsErr;

    if (noShow && noShow.length) {
      const ids = noShow.map((b) => b.id);
      // Anzahlung verfällt → payment_status bleibt 'deposit_paid' für die Buchhaltung,
      // aber cancelled_at + status='rejected' geben das Slot frei.
      const { error: updErr } = await admin
        .from('bookings')
        .update({
          status: 'rejected',
          cancelled_at: nowIso,
          cancelled_by: 'system',
        })
        .in('id', ids);
      if (updErr) throw updErr;
      result.onsite_no_show = ids;

      // Customer-Mail (Storno wegen ausgebliebener Restzahlung)
      await Promise.all(
        ids.map((id) =>
          fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
            body: JSON.stringify({ type: 'onsite_no_show_cancelled', booking_id: id }),
          }).catch((e) => console.error('mail (no_show) failed', id, e)),
        ),
      );

      // Customer + Admin In-App Notifications
      try {
        // Customer-Notifications
        const customerNotifs = noShow
          .filter((b) => b.user_id)
          .map((b) => ({
            user_id: b.user_id as string,
            type: 'booking_cancelled',
            title: 'Buchung automatisch storniert',
            message: `Die Restzahlung für Buchung #${b.id.slice(0, 8)} wurde vor Ort nicht beglichen. Die Anzahlung verfällt.`,
            link: `/account`,
            booking_id: b.id,
          }));
        if (customerNotifs.length) {
          await admin.from('notifications').insert(customerNotifs);
        }

        // Admin-Notifications
        const { data: admins } = await admin
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');
        if (admins && admins.length) {
          const adminNotifs = admins.flatMap((a) =>
            noShow.map((b) => ({
              user_id: a.user_id,
              type: 'booking_auto_cancelled',
              title: 'Auto-Storno: Restzahlung ausgeblieben',
              message: `#${b.id.slice(0, 8)} (${b.first_name ?? '—'}) wurde automatisch storniert. Anzahlung €${Number(b.deposit_amount ?? 0).toFixed(2)} verfällt.`,
              link: `/admin?booking=${b.id}`,
              booking_id: b.id,
            })),
          );
          if (adminNotifs.length) {
            await admin.from('notifications').insert(adminNotifs);
          }
        }
      } catch (e) {
        console.error('notification insert failed', e);
      }
    }

    return new Response(
      JSON.stringify({
        cancelled:
          (result.deposit_expired.length ?? 0) + (result.onsite_no_show.length ?? 0),
        ...result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('auto-cancel-unpaid-bookings error', e);
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
