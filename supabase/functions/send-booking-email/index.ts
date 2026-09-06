// Buchungs-E-Mails. Kunden-Mails werden in der Sprache der Buchung (bookings.language)
// verschickt: DE / EN / CS / SK, Fallback Deutsch. Admin-Mails bleiben auf Deutsch.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  fmtDate,
  fmtDateTime,
  normalizeLang,
  translator,
  type Lang,
  type T,
} from "../_shared/email-i18n.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type:
    | "admin_new"
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
    | "cancelled_deposit_forfeit"
    | "onsite_no_show_cancelled";
  booking_id: string;
  payment_url?: string;
}

const fmtDe = (s: string) =>
  new Date(s).toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" });

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
  booking_number: string | null;
  language: Lang;
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
  const d = data as any;
  return {
    id: d.id,
    first_name: d.first_name,
    last_name: d.last_name,
    email: d.email,
    phone: d.phone,
    message: d.message ?? "",
    start_date: d.start_date,
    end_date: d.end_date,
    nights: d.nights ?? 0,
    persons: d.persons,
    companions: d.companions ?? 0,
    booking_mode: d.booking_mode ?? "weekend",
    accommodation_type: d.accommodation_type ?? "none",
    accommodation_persons: d.accommodation_persons ?? 0,
    all_inclusive: !!d.all_inclusive,
    license_price: Number(d.license_price ?? 0),
    accommodation_price: Number(d.accommodation_price ?? 0),
    cleaning_price: Number(d.cleaning_price ?? 0),
    all_inclusive_price: Number(d.all_inclusive_price ?? 0),
    extras_price: Number(d.extras_price ?? 0),
    total_price: Number(d.total_price ?? 0),
    extras: d.extras ?? [],
    spot_name: d.fishing_spots?.name ?? "Platz",
    booking_number: d.booking_number ?? null,
    language: normalizeLang(d.language),
  };
};

const accLabel = (t: T, type: string) => t(`acc_${type}`) || type;

const buildPriceRows = (b: BookingDetails, t: T) => {
  const rows: { label: string; value: number }[] = [];
  if (b.license_price > 0)
    rows.push({
      label: b.booking_mode === "weekend" ? t("weekendCard") : t("license"),
      value: b.license_price,
    });
  if (b.accommodation_price > 0)
    rows.push({ label: accLabel(t, b.accommodation_type), value: b.accommodation_price });
  if (b.cleaning_price > 0) rows.push({ label: t("cleaning"), value: b.cleaning_price });
  if (b.all_inclusive_price > 0) rows.push({ label: t("allInclusive"), value: b.all_inclusive_price });
  if (Array.isArray(b.extras)) {
    for (const e of b.extras) {
      const label = e.quantity && e.quantity > 1 ? `${e.name} (${e.quantity})` : e.name;
      rows.push({ label, value: Number(e.total ?? 0) });
    }
  }
  return rows;
};

const renderPriceTable = (b: BookingDetails, t: T) => {
  const items = buildPriceRows(b, t)
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
        <td style="padding:6px 0;font-size:14px;font-weight:bold;color:#4a5a3a;">${t("totalSum")}</td>
        <td style="padding:6px 0;font-size:14px;font-weight:bold;color:#4a5a3a;text-align:right;">€${b.total_price.toFixed(2)}</td>
      </tr>
    </table>`;
};

const shell = (inner: string, t: T, width = 560) => `
  <div style="font-family:Arial,sans-serif;max-width:${width}px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
    ${inner}
    <p style="font-size:13px;color:#666;margin-top:24px;">${t("footer")}</p>
  </div>`;

const h1 = (text: string, color = "#4a5a3a") =>
  `<h1 style="font-size:22px;color:${color};margin:0 0 20px;">${text}</h1>`;
const p = (text: string) => `<p style="font-size:14px;line-height:1.6;">${text}</p>`;
const h3 = (text: string) => `<h3 style="font-size:14px;color:#4a5a3a;margin:24px 0 10px;">${text}</h3>`;

interface PaySettings {
  bank_holder: string;
  iban: string;
  bic: string;
  deposit_deadline_hours: number;
  deposit_percent: number;
  full_payment_days_before: number;
  cancellation_days_before: number;
}

const renderBankBlock = (s: PaySettings, amount: number, reference: string, t: T, deadline?: string) => {
  const ibanDisplay = s.iban ? s.iban.replace(/(.{4})/g, "$1 ").trim() : "—";
  return `
    <div style="background:#f5f5f0;padding:18px 20px;margin:18px 0;border-left:3px solid #8a7530;">
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5a3a;">${t("bankTransfer")}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1a1a1a;">
        <tr><td style="padding:3px 0;width:150px;color:#666;">${t("recipient")}</td><td style="padding:3px 0;"><strong>${s.bank_holder || "—"}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">IBAN</td><td style="padding:3px 0;font-family:monospace;"><strong>${ibanDisplay}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">BIC</td><td style="padding:3px 0;font-family:monospace;"><strong>${s.bic || "—"}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">${t("amount")}</td><td style="padding:3px 0;"><strong style="color:#4a5a3a;font-size:15px;">€${amount.toFixed(2)}</strong></td></tr>
        <tr><td style="padding:3px 0;color:#666;">${t("reference")}</td><td style="padding:3px 0;font-family:monospace;"><strong>${reference}</strong></td></tr>
        ${deadline ? `<tr><td style="padding:3px 0;color:#666;">${t("deadline")}</td><td style="padding:3px 0;color:#a02020;"><strong>${deadline}</strong></td></tr>` : ""}
      </table>
    </div>`;
};

// ─── Admin (immer Deutsch) ──────────────────────────────────────────────────
const adminEmail = (b: BookingDetails) => {
  const t = translator("de");
  const dateRange = `${fmtDe(b.start_date)} – ${fmtDe(b.end_date)}`;
  return {
    subject: `Neue Buchungsanfrage: ${b.first_name} ${b.last_name} · ${b.spot_name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px 20px;color:#1a1a1a;">
        <h1 style="font-size:20px;color:#4a5a3a;margin:0 0 16px;">Neue Buchungsanfrage</h1>
        <div style="background:#f5f5f0;padding:16px 18px;margin:0 0 20px;border-left:3px solid #8a7530;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Platz:</strong> ${b.spot_name}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Zeitraum:</strong> ${dateRange} (${b.nights} N)</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Personen:</strong> ${b.persons} Angler${b.companions ? ` + ${b.companions} Begleitung` : ""}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Sprache Gast:</strong> ${b.language.toUpperCase()}</p>
        </div>
        <h3 style="font-size:14px;color:#4a5a3a;margin:0 0 10px;">Preisaufstellung</h3>
        ${renderPriceTable(b, t)}
        <h3 style="font-size:14px;color:#4a5a3a;margin:24px 0 10px;">Kontakt</h3>
        <p style="margin:0 0 6px;font-size:13px;"><strong>E-Mail:</strong> <a href="mailto:${b.email}">${b.email}</a></p>
        <p style="margin:0 0 6px;font-size:13px;"><strong>Telefon:</strong> <a href="tel:${b.phone}">${b.phone}</a></p>
        ${b.message ? `<p style="margin:12px 0 0;font-size:13px;font-style:italic;background:#f5f5f0;padding:10px;">„${b.message}"</p>` : ""}
      </div>`,
    text: `Neue Anfrage: ${b.first_name} ${b.last_name} – ${b.spot_name} (${dateRange}). Gesamt €${b.total_price.toFixed(2)}.`,
  };
};

// ─── Kunden-Mails (übersetzt) ───────────────────────────────────────────────
const ctx = (b: BookingDetails) => {
  const t = translator(b.language);
  const range = `${fmtDate(b.start_date, b.language)} – ${fmtDate(b.end_date, b.language)}`;
  return { t, range, name: b.first_name, spot: b.spot_name };
};

const depositRequestEmail = (b: BookingDetails, s: PaySettings) => {
  const { t, range, name, spot } = ctx(b);
  const deposit = Math.round(b.total_price * s.deposit_percent) / 100;
  const deadlineHours = s.deposit_deadline_hours || 168;
  const deadlineDate = new Date(Date.now() + deadlineHours * 3600_000);
  const days = Math.round(deadlineHours / 24);
  const start = new Date(b.start_date);
  const dd = String(start.getDate()).padStart(2, "0");
  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const ref = `${b.booking_number ?? "BM1"} ${dd}.${mm}/${start.getFullYear()}`;
  const deadline = fmtDateTime(deadlineDate.toISOString(), b.language);
  return {
    subject: t("depositSubject", { no: b.booking_number ?? "", deposit: deposit.toFixed(2) }),
    html: shell(
      `${h1(t("depositTitle"))}
       ${p(t("hello", { name }))}
       ${p(t("depositBody", { spot, range, deposit: deposit.toFixed(2), percent: s.deposit_percent, days }))}
       ${renderBankBlock(s, deposit, ref, t, deadline)}
       <p style="font-size:13px;line-height:1.6;background:#f6f4ee;border-left:3px solid #6f7e44;padding:12px 14px;">${t("depositRefNote", { ref })}</p>
       ${h3(t("priceHeading"))}
       ${renderPriceTable(b, t)}
       ${h3(t("directions"))}
       <p style="font-size:13px;line-height:1.6;">${t("directionsText")}</p>
       <p style="font-size:12px;line-height:1.6;color:#888;margin-top:24px;">${t("depositWarning", { days })}</p>`,
      t,
      600,
    ),
    text: t("depositText", {
      name,
      deposit: deposit.toFixed(2),
      holder: s.bank_holder,
      iban: s.iban,
      bic: s.bic,
      ref,
      deadline,
    }),
  };
};

const depositReceivedEmail = (b: BookingDetails, s: PaySettings) => {
  const { t, range, name, spot } = ctx(b);
  const final = b.total_price - Math.round(b.total_price * s.deposit_percent) / 100;
  return {
    subject: t("depRecSubject"),
    html: shell(
      `${h1(t("depRecTitle"))}${p(t("hello", { name }))}${p(t("depRecBody", { spot, range }))}${p(t("depRecFinal", { final: final.toFixed(2) }))}`,
      t,
    ),
    text: t("depRecText", { name, spot, range, final: final.toFixed(2) }),
  };
};

const finalPaymentRequestEmail = (b: BookingDetails, s: PaySettings) => {
  const { t, name, spot } = ctx(b);
  const deposit = Math.round(b.total_price * s.deposit_percent) / 100;
  const final = b.total_price - deposit;
  const ref = `Bucht M1 / ${b.last_name} / ${b.id.slice(0, 8)}`;
  return {
    subject: t("finReqSubject", { final: final.toFixed(2) }),
    html: shell(
      `${h1(t("finReqTitle"))}${p(t("hello", { name }))}${p(
        t("finReqBody", { spot, start: fmtDate(b.start_date, b.language), final: final.toFixed(2) }),
      )}${renderBankBlock(s, final, ref, t)}`,
      t,
      600,
    ),
    text: t("finReqText", { name, final: final.toFixed(2), ref }),
  };
};

const finalPaymentReceivedEmail = (b: BookingDetails) => {
  const { t, range, name, spot } = ctx(b);
  return {
    subject: t("finRecSubject"),
    html: shell(`${h1(t("finRecTitle"))}${p(t("hello", { name }))}${p(t("finRecBody", { spot, range }))}`, t),
    text: t("finRecText", { name, spot, range }),
  };
};

const cancelledForfeitEmail = (b: BookingDetails, noShow = false) => {
  const { t, range, name, spot } = ctx(b);
  return {
    subject: t("cancelSubject"),
    html: shell(
      `${h1(t("cancelTitle"), "#1a1a1a")}${p(t("hello", { name }))}${p(
        t(noShow ? "noShowBody" : "cancelBody", { spot, range }),
      )}`,
      t,
      520,
    ),
    text: t("cancelText", { name, spot, range }),
  };
};

const expiredEmail = (b: BookingDetails) => {
  const { t, range, name, spot } = ctx(b);
  return {
    subject: t("expiredSubject"),
    html: shell(
      `${h1(t("expiredTitle"), "#1a1a1a")}${p(t("hello", { name }))}${p(t("expiredBody", { spot, range }))}${p(t("expiredHint"))}`,
      t,
      520,
    ),
    text: t("expiredText", { name, spot, range }),
  };
};

const paidEmail = (b: BookingDetails) => {
  const { t, range, name, spot } = ctx(b);
  return {
    subject: t("paidSubject"),
    html: shell(
      `${h1(t("paidTitle"))}${p(t("hello", { name }))}${p(t("paidBody", { spot, range }))}${h3(t("priceHeading"))}${renderPriceTable(b, t)}`,
      t,
    ),
    text: t("paidText", { name, spot, range }),
  };
};

const approvedEmail = (b: BookingDetails, paymentUrl?: string) => {
  const { t, range, name, spot } = ctx(b);
  const payBlock = paymentUrl
    ? `<div style="text-align:center;margin:28px 0;"><a href="${paymentUrl}" style="display:inline-block;background:#4a5a3a;color:#fff;text-decoration:none;padding:14px 32px;font-size:14px;letter-spacing:0.05em;">${t("payNowCta")}</a></div>`
    : "";
  return {
    subject: t("approvedSubject"),
    html: shell(
      `${h1(t("approvedTitle"))}${p(t("hello", { name }))}${p(t("approvedBody", { spot }))}
       <div style="background:#f5f5f0;padding:18px;margin:20px 0;border-left:3px solid #4a5a3a;">
         <p style="margin:0 0 6px;font-size:13px;"><strong>${t("period")}:</strong> ${range}</p>
         <p style="margin:0 0 6px;font-size:13px;"><strong>${t("persons")}:</strong> ${b.persons} ${t("anglers")}${b.companions ? ` + ${b.companions} ${t("companionsLabel")}` : ""}</p>
         <p style="margin:0 0 6px;font-size:13px;"><strong>${t("accommodation")}:</strong> ${accLabel(t, b.accommodation_type)}</p>
       </div>
       ${h3(t("priceHeading"))}${renderPriceTable(b, t)}${payBlock}`,
      t,
    ),
    text: t("approvedText", { name, spot, range }),
  };
};

const approvedPayNowEmail = (b: BookingDetails, siteOrigin: string) => {
  const { t, range, name, spot } = ctx(b);
  const payUrl = `${siteOrigin}/account?pay=${b.id}`;
  return {
    subject: t("payNowSubject"),
    html: shell(
      `${h1(t("payNowTitle"))}${p(t("hello", { name }))}${p(t("payNowBody", { spot, range }))}
       ${h3(t("priceHeading"))}${renderPriceTable(b, t)}
       <div style="text-align:center;margin:28px 0;"><a href="${payUrl}" style="display:inline-block;background:#4a5a3a;color:#fff;text-decoration:none;padding:14px 32px;font-size:14px;letter-spacing:0.05em;">${t("payNowCta")}</a></div>
       <p style="font-size:12px;color:#666;line-height:1.5;">${t("payNowFallback")} <a href="${payUrl}">${payUrl}</a></p>`,
      t,
    ),
    text: t("payNowText", { name, spot, range, url: payUrl }),
  };
};

const rejectedEmail = (b: BookingDetails) => {
  const { t, range, name, spot } = ctx(b);
  return {
    subject: t("rejectedSubject"),
    html: shell(
      `${h1(t("rejectedTitle"), "#1a1a1a")}${p(t("hello", { name }))}${p(t("rejectedBody", { spot, range }))}${p(t("rejectedHint"))}`,
      t,
      520,
    ),
    text: t("rejectedText", { name, spot, range }),
  };
};

const requestReceivedEmail = (b: BookingDetails) => {
  const { t, range, name, spot } = ctx(b);
  return {
    subject: t("receivedSubject"),
    html: shell(
      `${h1(t("receivedTitle"))}${p(t("hello", { name }))}${p(t("receivedBody", { spot, range }))}${h3(t("priceHeading"))}${renderPriceTable(b, t)}`,
      t,
    ),
    text: t("receivedText", { name, spot, range }),
  };
};

const refundedEmail = (b: BookingDetails) => {
  const { t, range, name, spot } = ctx(b);
  return {
    subject: t("refundedSubject"),
    html: shell(
      `${h1(t("refundedTitle"), "#1a1a1a")}${p(t("hello", { name }))}${p(t("refundedBody", { spot, range }))}`,
      t,
      520,
    ),
    text: t("refundedText", { name, spot, range }),
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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = (await req.json()) as EmailRequest;
    if (!body.type || !body.booking_id) return json({ error: "Invalid request" }, 400);

    const smtpKey = Deno.env.get("SMTP2GO_API_KEY");
    if (!smtpKey) return json({ error: "Email service not configured" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const booking = await fetchBooking(supabase, body.booking_id);
    if (!booking) return json({ error: "Booking not found" }, 404);

    if (body.type === "admin_new") {
      const { data: roles, error: rolesErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      if (rolesErr) throw rolesErr;

      const adminEmails: string[] = [];
      for (const r of roles ?? []) {
        const { data: u } = await supabase.auth.admin.getUserById((r as any).user_id);
        if (u?.user?.email) adminEmails.push(u.user.email);
      }
      if (adminEmails.length === 0) adminEmails.push("info@buchtm1.at");

      const mail = adminEmail(booking);
      await sendMail(smtpKey, adminEmails, mail.subject, mail.html, mail.text);
      return json({ success: true, recipients: adminEmails.length });
    }

    const needsSettings =
      body.type === "deposit_request" ||
      body.type === "deposit_received" ||
      body.type === "final_payment_request";

    let s: PaySettings = {
      bank_holder: "",
      iban: "",
      bic: "",
      deposit_deadline_hours: 168,
      deposit_percent: 50,
      full_payment_days_before: 14,
      cancellation_days_before: 14,
    };
    if (needsSettings) {
      const { data: settings } = await supabase
        .from("payment_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      const st = settings as any;
      s = {
        bank_holder: st?.bank_holder ?? "",
        iban: st?.iban ?? "",
        bic: st?.bic ?? "",
        deposit_deadline_hours: st?.deposit_deadline_hours ?? 168,
        deposit_percent: st?.deposit_percent ?? 50,
        full_payment_days_before: st?.full_payment_days_before ?? 14,
        cancellation_days_before: st?.cancellation_days_before ?? 14,
      };
    }

    let mail;
    switch (body.type) {
      case "approved":
        mail = approvedEmail(booking, body.payment_url);
        break;
      case "approved_pay_now":
        mail = approvedPayNowEmail(booking, Deno.env.get("SITE_URL") || "https://buchtm1.purtuc.at");
        break;
      case "rejected":
        mail = rejectedEmail(booking);
        break;
      case "request_received":
        mail = requestReceivedEmail(booking);
        break;
      case "paid":
        mail = paidEmail(booking);
        break;
      case "expired":
      case "payment_expired":
        mail = expiredEmail(booking);
        break;
      case "refunded":
        mail = refundedEmail(booking);
        break;
      case "deposit_request":
        mail = depositRequestEmail(booking, s);
        break;
      case "deposit_received":
        mail = depositReceivedEmail(booking, s);
        break;
      case "final_payment_request":
        mail = finalPaymentRequestEmail(booking, s);
        break;
      case "final_payment_received":
        mail = finalPaymentReceivedEmail(booking);
        break;
      case "cancelled_deposit_forfeit":
        mail = cancelledForfeitEmail(booking, false);
        break;
      case "onsite_no_show_cancelled":
        mail = cancelledForfeitEmail(booking, true);
        break;
      default:
        return json({ error: "Unknown type" }, 400);
    }

    await sendMail(smtpKey, [booking.email], mail.subject, mail.html, mail.text);
    return json({ success: true, language: booking.language });
  } catch (err) {
    console.error("send-booking-email error:", err);
    return json({ error: String(err) }, 500);
  }
});
