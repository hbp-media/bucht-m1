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
    | "refunded"
    | "deposit_request"
    | "deposit_received"
    | "final_payment_request"
    | "final_payment_received"
    | "cancelled_deposit_forfeit";
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

interface PaySettings {
  bank_holder: string;
  iban: string;
  bic: string;
  deposit_deadline_hours: number;
  deposit_percent: number;
  full_payment_days_before: number;
  cancellation_days_before: number;
}

const renderBankBlock = (s: PaySettings, amount: number, reference: string, deadline?: string) => {
  const ibanDisplay = s.iban ? s.iban.replace(/(.{4})/g, "$1 ").trim() : "—";
  return `
    <div style="background:#f5f5f0;padding:18px 20px;margin:18px 0;border-left:3px solid #8a7530;">
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5a3a;">Banküberweisung</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1a1a1a;">
        <tr><td style="padding:3px 0;width:140px;color:#666;">Empfänger</td><td style="padding:3px 0;"><strong>${s.bank_holder || "—"}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">IBAN</td><td style="padding:3px 0;font-family:monospace;"><strong>${ibanDisplay}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">BIC</td><td style="padding:3px 0;font-family:monospace;"><strong>${s.bic || "—"}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">Betrag</td><td style="padding:3px 0;"><strong style="color:#4a5a3a;font-size:15px;">€${amount.toFixed(2)}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">Verwendungszweck</td><td style="padding:3px 0;font-family:monospace;"><strong>${reference}</strong></td></tr>
        ${deadline ? `<tr><td style="padding:3px 0;color:#666;">Frist</td><td style="padding:3px 0;color:#a02020;"><strong>${deadline}</strong></td></tr>` : ""}
      </table>
    </div>`;
};

const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString("de-AT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const depositRequestEmail = (b: BookingDetails, s: PaySettings) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  const deposit = Math.round(b.total_price * s.deposit_percent) / 100;
  const deadline = new Date(Date.now() + (s.deposit_deadline_hours || 24) * 3600_000);
  const ref = `Bucht M1 / ${b.last_name} / ${b.id.slice(0, 8)}`;
  return {
    subject: `Anzahlung für deine Buchung – €${deposit.toFixed(2)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Buchung freigegeben ✓</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">
          deine Anfrage für <strong>${b.spot_name}</strong> (${dateRange}) wurde geprüft und freigegeben.
          Damit wir die Reservierung verbindlich sichern können, bitten wir dich um eine
          <strong>Anzahlung von €${deposit.toFixed(2)} (${s.deposit_percent}%)</strong> innerhalb von
          <strong>${s.deposit_deadline_hours} Stunden</strong>. Die Restzahlung ist
          ${s.full_payment_days_before} Tage vor Anreise fällig.
        </p>
        ${renderBankBlock(s, deposit, ref, fmtDateTime(deadline.toISOString()))}
        <h3 style="font-size:14px;color:#4a5a3a;margin:24px 0 10px;">Gesamtaufstellung</h3>
        ${renderPriceTable(b)}
        <p style="font-size:12px;line-height:1.6;color:#888;margin-top:24px;">
          Wichtig: Bitte gib den Verwendungszweck genau wie oben angegeben an, sonst können wir die Zahlung nicht zuordnen.
          Geht die Anzahlung nicht rechtzeitig ein, wird die Reservierung automatisch storniert.
        </p>
        <p style="font-size:13px;color:#666;margin-top:24px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, bitte überweise eine Anzahlung von €${deposit.toFixed(2)} an ${s.bank_holder} IBAN ${s.iban} BIC ${s.bic}. Verwendungszweck: ${ref}. Frist: ${fmtDateTime(deadline.toISOString())}.`,
  };
};

const depositReceivedEmail = (b: BookingDetails, s: PaySettings) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  const finalDue = b.total_price - (Math.round(b.total_price * s.deposit_percent) / 100);
  return {
    subject: "Anzahlung erhalten – Buchung gesichert",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Anzahlung erhalten ✓</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">
          deine Anzahlung für <strong>${b.spot_name}</strong> (${dateRange}) ist bei uns eingegangen.
          Die Reservierung ist nun verbindlich gesichert.
        </p>
        <p style="font-size:14px;line-height:1.6;">
          Die <strong>Restzahlung von €${finalDue.toFixed(2)}</strong> wird ${s.full_payment_days_before} Tage vor Anreise fällig –
          du erhältst rechtzeitig eine separate E-Mail mit den Bankdaten.
        </p>
        <p style="font-size:13px;color:#666;margin-top:24px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, deine Anzahlung für ${b.spot_name} (${dateRange}) ist eingegangen. Restzahlung €${finalDue.toFixed(2)} ${s.full_payment_days_before} Tage vor Anreise.`,
  };
};

const finalPaymentRequestEmail = (b: BookingDetails, s: PaySettings) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  const deposit = Math.round(b.total_price * s.deposit_percent) / 100;
  const finalDue = b.total_price - deposit;
  const ref = `Bucht M1 / ${b.last_name} / ${b.id.slice(0, 8)}`;
  return {
    subject: `Restzahlung für deine Buchung – €${finalDue.toFixed(2)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Restzahlung fällig</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">
          deine Anreise zum <strong>${b.spot_name}</strong> am <strong>${fmt(b.start_date)}</strong> rückt näher.
          Bitte überweise die Restzahlung von <strong>€${finalDue.toFixed(2)}</strong> bis spätestens
          <strong>${fmt(b.start_date)}</strong> (${s.full_payment_days_before} Tage vor Anreise).
        </p>
        ${renderBankBlock(s, finalDue, ref)}
        <p style="font-size:13px;color:#666;margin-top:24px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, bitte Restzahlung €${finalDue.toFixed(2)} an ${s.bank_holder} IBAN ${s.iban} überweisen. Verwendungszweck: ${ref}.`,
  };
};

const finalPaymentReceivedEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: "Vollständige Zahlung erhalten – wir freuen uns auf dich",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#4a5a3a;margin:0 0 20px;">Alles bezahlt ✓</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">
          deine Restzahlung für <strong>${b.spot_name}</strong> (${dateRange}) ist eingegangen.
          Wir freuen uns auf deinen Besuch!
        </p>
        <p style="font-size:13px;color:#666;margin-top:24px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, deine Restzahlung für ${b.spot_name} (${dateRange}) ist eingegangen.`,
  };
};

const cancelledForfeitEmail = (b: BookingDetails) => {
  const dateRange = `${fmt(b.start_date)} – ${fmt(b.end_date)}`;
  return {
    subject: "Buchung storniert",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <h1 style="font-size:22px;color:#1a1a1a;margin:0 0 20px;">Buchung storniert</h1>
        <p style="font-size:14px;line-height:1.6;">Hallo ${b.first_name},</p>
        <p style="font-size:14px;line-height:1.6;">
          deine Buchung für <strong>${b.spot_name}</strong> (${dateRange}) wurde storniert.
          Da die Stornierung nach Ablauf der Storno-Frist erfolgte, verfällt die geleistete Anzahlung gemäß unseren Bedingungen.
        </p>
        <p style="font-size:13px;color:#666;margin-top:24px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `Hallo ${b.first_name}, deine Buchung für ${b.spot_name} (${dateRange}) wurde storniert. Anzahlung verfällt.`,
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

    if (
      body.type === "deposit_request" ||
      body.type === "deposit_received" ||
      body.type === "final_payment_request" ||
      body.type === "final_payment_received" ||
      body.type === "cancelled_deposit_forfeit"
    ) {
      const { data: settings } = await supabase
        .from("payment_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      const s: PaySettings = {
        bank_holder: settings?.bank_holder ?? "",
        iban: settings?.iban ?? "",
        bic: settings?.bic ?? "",
        deposit_deadline_hours: settings?.deposit_deadline_hours ?? 24,
        deposit_percent: settings?.deposit_percent ?? 50,
        full_payment_days_before: settings?.full_payment_days_before ?? 14,
        cancellation_days_before: settings?.cancellation_days_before ?? 14,
      };
      let mail;
      if (body.type === "deposit_request") mail = depositRequestEmail(booking, s);
      else if (body.type === "deposit_received") mail = depositReceivedEmail(booking, s);
      else if (body.type === "final_payment_request") mail = finalPaymentRequestEmail(booking, s);
      else if (body.type === "final_payment_received") mail = finalPaymentReceivedEmail(booking);
      else mail = cancelledForfeitEmail(booking);
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
