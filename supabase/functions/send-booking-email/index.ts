// Buchungs-E-Mails: admin_new, approved (mit Zahlungslink), rejected
// Wichtig: KEIN automatischer Kunden-Mail bei Anfrage. Nur Admin-Benachrichtigung.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNewRequest {
  type: "admin_new";
  booking_id: string;
}

interface CustomerDecisionRequest {
  type:
    | "approved"
    | "approved_pay_now"
    | "rejected"
    | "request_received"
    | "paid"
    | "expired"
    | "payment_expired"
    | "refunded";
  booking_id: string;
  payment_url?: string;
}

type EmailRequest = AdminNewRequest | CustomerDecisionRequest;

const fmt = (s: string) =>
  new Date(s).toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const ACC_LABEL: Record<string, string> = {
  none: "Ohne Unterkunft",
  hut: "Fischerhütte",
  caravan: "Wohnwagen",
};

interface BookingDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  start_date: string;
  end_date: string;
  nights: number;
  persons: number;
  companions: number;
  booking_mode: string;
  accommodation_type: string;
  accommodation_persons: number;
  all_inclusive: boolean;
  license_price: number;
  accommodation_price: number;
  cleaning_price: number;
  all_inclusive_price: number;
  extras_price: number;
  total_price: number;
  extras: any;
  spot_name: string;
}

const fetchBooking = async (
  supabase: ReturnType<typeof createClient>,
  bookingId: string,
): Promise<BookingDetails | null> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, fishing_spots(name)")
    .eq("id", bookingId)
    .maybeSingle();
  if (error || !data) {
    console.error("fetchBooking error", error);
    return null;
  }
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    message: data.message ?? "",
    start_date: data.start_date,
    end_date: data.end_date,
    nights: data.nights ?? 0,
    persons: data.persons,
    companions: data.companions ?? 0,
    booking_mode: data.booking_mode ?? "weekend",
    accommodation_type: data.accommodation_type ?? "none",
    accommodation_persons: data.accommodation_persons ?? 0,
    all_inclusive: !!data.all_inclusive,
    license_price: Number(data.license_price ?? 0),
    accommodation_price: Number(data.accommodation_price ?? 0),
    cleaning_price: Number(data.cleaning_price ?? 0),
    all_inclusive_price: Number(data.all_inclusive_price ?? 0),
    extras_price: Number(data.extras_price ?? 0),
    total_price: Number(data.total_price ?? 0),
    extras: data.extras ?? [],
    spot_name: (data as any).fishing_spots?.name ?? "Platz",
  };
};

const buildPriceRows = (b: BookingDetails) => {
  const rows: { label: string; value: number }[] = [];
  if (b.license_price > 0)
    rows.push({
      label: b.booking_mode === "weekend" ? "Wochenend-Karte" : "Fischerlizenz (72h+)",
      value: b.license_price,
    });
  if (b.accommodation_price > 0)
    rows.push({ label: ACC_LABEL[b.accommodation_type], value: b.accommodation_price });
  if (b.cleaning_price > 0)
    rows.push({ label: "Endreinigung", value: b.cleaning_price });
  if (b.all_inclusive_price > 0)
    rows.push({ label: "All Inclusive", value: b.all_inclusive_price });
  if (Array.isArray(b.extras)) {
    for (const e of b.extras) {
      const label = e.quantity && e.quantity > 1 ? `${e.name} (${e.quantity})` : e.name;
      rows.push({ label, value: Number(e.total ?? 0) });
    }
  }
  return rows;
};

const renderPriceTable = (b: BookingDetails) => {
  const rows = buildPriceRows(b);
  const items = rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0;font-size:13px;color:#1a1a1a;">${r.label}</td><td style="padding:6px 0;font-size:13px;color:#1a1a1a;text-align:right;">€${r.value.toFixed(2)}</td></tr>`,
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;margin:0;">
      ${items}
      <tr><td colspan="2" style="padding:8px 0;border-top:1px solid #e5e5e0;"></td></tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;font-weight:bold;color:#4a5a3a;">Gesamtsumme</td>
        <td style="padding:6px 0;font-size:14px;font-weight:bold;color:#4a5a3a;text-align:right;">€${b.total_price.toFixed(2)}</td>
      </tr>
    </table>`;
};

const adminEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: `Neue Buchungsanfrage: ${b.first_name} ${b.last_name} · ${b.spot_name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px 20px;color:#1a1a1a;">
        <h1 style="font-size:20px;color:#4a5a3a;margin:0 0 16px;">Neue Buchungsanfrage</h1>
        <p style="font-size:14px;line-height:1.5;margin:0 0 18px;">
          ${b.first_name} ${b.last_name} hat eine Anfrage gestellt:
        </p>
        <div style="background:#f5f5f0;padding:16px 18px;margin:0 0 20px;border-left:3px solid #8a7530;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Platz:</strong> ${b.spot_name}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Zeitraum:</strong> ${dateRange} (${b.nights} N)</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Modus:</strong> ${b.booking_mode === "weekend" ? "Wochenende" : "Frei gewählt"}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Personen:</strong> ${b.persons} Angler${b.companions ? ` + ${b.companions} Begleitung` : ""}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Unterkunft:</strong> ${ACC_LABEL[b.accommodation_type]}${b.accommodation_persons ? ` (${b.accommodation_persons} P)` : ""}</p>
          ${b.all_inclusive ? `<p style="margin:0 0 6px;font-size:13px;"><strong>All Inclusive:</strong> Ja</p>` : ""}
        </div>

        <h3 style="font-size:14px;color:#4a5a3a;margin:0 0 10px;">Preisaufstellung</h3>
        ${renderPriceTable(b)}

        <h3 style="font-size:14px;color:#4a5a3a;margin:24px 0 10px;">Kontakt</h3>
        <p style="margin:0 0 6px;font-size:13px;"><strong>E-Mail:</strong> <a href="mailto:${b.email}">${b.email}</a></p>
        <p style="margin:0 0 6px;font-size:13px;"><strong>Telefon:</strong> <a href="tel:${b.phone}">${b.phone}</a></p>
        ${b.message ? `<p style="margin:12px 0 0;font-size:13px;font-style:italic;background:#f5f5f0;padding:10px;">„${b.message}"</p>` : ""}

        <p style="font-size:12px;color:#888;margin-top:24px;">Bitte im Admin-Bereich annehmen oder ablehnen.</p>
      </div>`,
    text: `Neue Anfrage: ${b.first_name} ${b.last_name} – ${b.spot_name} (${dateRange}). Gesamt €${b.total_price.toFixed(2)}. E-Mail ${b.email} · Tel ${b.phone}`,
  };
};

const approvedEmail = (b: BookingDetails, paymentUrl?: string) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  const paymentBlock = paymentUrl
    ? `<div style="text-align:center;margin:28px 0;">
         <a href="${paymentUrl}" style="display:inline-block;background:#4a5a3a;color:#fff;text-decoration:none;padding:14px 32px;font-size:14px;letter-spacing:0.05em;">Jetzt sicher bezahlen</a>
       </div>
       <p style="font-size:13px;line-height:1.5;color:#666;margin:0 0 16px;">Erst nach Zahlungseingang ist deine Reservierung verbindlich gesichert.</p>`
    : `<p style="font-size:14px;line-height:1.5;">Wir senden dir die Zahlungsdetails in Kürze separat zu.</p>`;
  return {
    subject: "Deine Buchung wurde bestätigt",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Buchung bestätigt ✓</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">Wir freuen uns, deine Buchung für <strong>${b.spot_name}</strong> bestätigen zu können.</p>
        <div style="background:#f5f5f0;padding:18px;margin:20px 0;border-left:3px solid #4a5a3a;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Zeitraum:</strong> ${dateRange}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Personen:</strong> ${b.persons} Angler${b.companions ? ` + ${b.companions} Begleitung` : ""}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Unterkunft:</strong> ${ACC_LABEL[b.accommodation_type]}</p>
        </div>
        <h3 style="font-size:14px;color:#4a5a3a;margin:20px 0 10px;">Preisaufstellung</h3>
        ${renderPriceTable(b)}
        ${paymentBlock}
        <p style="font-size:13px;color:#666;margin-top:24px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, deine Buchung für ${b.spot_name} (${dateRange}) wurde bestätigt. Gesamt €${b.total_price.toFixed(2)}.${paymentUrl ? ` Zahlung: ${paymentUrl}` : ""}`,
  };
};

const rejectedEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: "Update zu deiner Buchungsanfrage",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#1a1a1a;margin:0 0 20px;">Anfrage konnte nicht bestätigt werden</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">leider können wir deine Anfrage für <strong>${b.spot_name}</strong> im Zeitraum <strong>${dateRange}</strong> aktuell nicht bestätigen.</p>
        <p style="font-size:14px;line-height:1.6;">Falls du andere Termine in Erwägung ziehst, melde dich gerne direkt bei uns – wir helfen dir gerne weiter.</p>
        <p style="font-size:13px;color:#666;margin-top:30px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, leider können wir deine Anfrage für ${b.spot_name} (${dateRange}) nicht bestätigen.`,
  };
};

const requestReceivedEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: "Wir haben deine Buchungsanfrage erhalten",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Anfrage eingegangen</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">vielen Dank für deine Buchungsanfrage für <strong>${b.spot_name}</strong> im Zeitraum <strong>${dateRange}</strong>.</p>
        <p style="font-size:14px;line-height:1.6;">Wir prüfen deine Anfrage und melden uns in Kürze per E-Mail mit einem Zahlungslink. Erst nach Zahlungseingang ist deine Reservierung verbindlich gesichert.</p>
        <h3 style="font-size:14px;color:#4a5a3a;margin:24px 0 10px;">Vorläufige Preisaufstellung</h3>
        ${renderPriceTable(b)}
        <p style="font-size:13px;color:#666;margin-top:30px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, wir haben deine Anfrage für ${b.spot_name} (${dateRange}) erhalten und melden uns in Kürze mit einem Zahlungslink.`,
  };
};

const approvedPayNowEmail = (b: BookingDetails, siteOrigin: string) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  const payUrl = `${siteOrigin}/account?pay=${b.id}`;
  return {
    subject: "Deine Buchung wurde freigegeben – jetzt bezahlen",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Buchung freigegeben ✓</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">deine Anfrage für <strong>${b.spot_name}</strong> (${dateRange}) wurde geprüft und freigegeben. Bitte schließe die Buchung innerhalb der nächsten <strong>60 Minuten</strong> mit der Zahlung ab – andernfalls wird der Platz wieder freigegeben.</p>
        <h3 style="font-size:14px;color:#4a5a3a;margin:20px 0 10px;">Preisaufstellung</h3>
        ${renderPriceTable(b)}
        <div style="text-align:center;margin:28px 0;">
          <a href="${payUrl}" style="display:inline-block;background:#4a5a3a;color:#fff;text-decoration:none;padding:14px 32px;font-size:14px;letter-spacing:0.05em;">Jetzt sicher bezahlen</a>
        </div>
        <p style="font-size:12px;color:#666;line-height:1.5;">Falls der Button nicht funktioniert, öffne diesen Link: <a href="${payUrl}">${payUrl}</a></p>
        <p style="font-size:13px;color:#666;margin-top:24px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, deine Buchung für ${b.spot_name} (${dateRange}) wurde freigegeben. Bitte zahle innerhalb von 60 Minuten: ${payUrl}`,
  };
};

const paidEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: "Zahlungseingang bestätigt – Buchung gesichert",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Zahlung erhalten ✓</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">vielen Dank! Wir haben deine Zahlung für <strong>${b.spot_name}</strong> (${dateRange}) erhalten. Deine Buchung ist verbindlich gesichert.</p>
        <h3 style="font-size:14px;color:#4a5a3a;margin:20px 0 10px;">Preisaufstellung</h3>
        ${renderPriceTable(b)}
        <p style="font-size:13px;color:#666;margin-top:24px;">Wir freuen uns auf dich!<br/>Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, wir haben deine Zahlung für ${b.spot_name} (${dateRange}) erhalten. Deine Buchung ist gesichert.`,
  };
};

const expiredEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: "Zahlungsfrist abgelaufen",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#1a1a1a;margin:0 0 20px;">Zahlungsfrist abgelaufen</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">deine freigegebene Buchung für <strong>${b.spot_name}</strong> (${dateRange}) wurde nicht innerhalb der Zahlungsfrist beglichen und ist verfallen. Der Platz wurde wieder freigegeben.</p>
        <p style="font-size:14px;line-height:1.6;">Du kannst jederzeit eine neue Anfrage stellen.</p>
        <p style="font-size:13px;color:#666;margin-top:30px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, die Zahlungsfrist für ${b.spot_name} (${dateRange}) ist abgelaufen. Der Platz ist wieder verfügbar.`,
  };
};

const refundedEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: "Erstattung bearbeitet",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#1a1a1a;margin:0 0 20px;">Erstattung bearbeitet</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">deine Buchung für <strong>${b.spot_name}</strong> (${dateRange}) wurde storniert und der Betrag erstattet. Die Gutschrift erfolgt über deinen ursprünglichen Zahlungsweg.</p>
        <p style="font-size:13px;color:#666;margin-top:30px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, deine Buchung für ${b.spot_name} (${dateRange}) wurde erstattet.`,
  };
};

const sendMail = async (apiKey: string, to: string[], subject: string, html: string, text: string) => {
  const res = await fetch("https://api.smtp2go.com/v3/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      to,
      sender: "Bucht M1 <noreply@purtuc.com>",
      subject,
      html_body: html,
      text_body: text,
    }),
  });
  const result = await res.json();
  if (!res.ok) {
    console.error("SMTP2GO error:", result);
    throw new Error("Failed to send email");
  }
  return result;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as EmailRequest;

    if (!body.type || !body.booking_id) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smtpKey = Deno.env.get("SMTP2GO_API_KEY");
    if (!smtpKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const booking = await fetchBooking(supabase, body.booking_id);
    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "admin_new") {
      // Admin-Mails: an alle User mit Rolle 'admin'
      const { data: roles, error: rolesErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      if (rolesErr) throw rolesErr;

      const adminIds = (roles ?? []).map((r: any) => r.user_id);
      const adminEmails: string[] = [];
      for (const id of adminIds) {
        const { data: u } = await supabase.auth.admin.getUserById(id);
        if (u?.user?.email) adminEmails.push(u.user.email);
      }
      // Fallback: feste Adresse
      if (adminEmails.length === 0) adminEmails.push("info@buchtm1.at");

      const mail = adminEmail(booking);
      await sendMail(smtpKey, adminEmails, mail.subject, mail.html, mail.text);

      return new Response(JSON.stringify({ success: true, recipients: adminEmails.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "approved") {
      const mail = approvedEmail(booking, body.payment_url);
      await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "rejected") {
      const mail = rejectedEmail(booking);
      await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "request_received") {
      const mail = requestReceivedEmail(booking);
      await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "approved_pay_now") {
      const siteOrigin = Deno.env.get("SITE_URL") || "https://buchtm1.purtuc.at";
      const mail = approvedPayNowEmail(booking, siteOrigin);
      await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "paid") {
      const mail = paidEmail(booking);
      await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "expired" || body.type === "payment_expired") {
      const mail = expiredEmail(booking);
      await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "refunded") {
      const mail = refundedEmail(booking);
      await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-booking-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
