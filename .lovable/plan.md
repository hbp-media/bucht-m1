
# Plan: Buchungs‑ & Bezahl‑Refactor

## Neuer Flow

```
1. User füllt Buchung aus → "Anfrage senden" (KEINE Zahlung)
   → Booking wird angelegt: status='pending', payment_status='unpaid'
   → E-Mail an Admin (neue Anfrage) + an User (Bestätigung Anfrage erhalten)

2. Admin sieht Anfrage in /admin → klickt "Freigeben & Zahlungslink senden"
   → status='approved', payment_status='unpaid', payment_deadline = jetzt + 60 Min
   → E-Mail an User mit Link /account?pay={bookingId}

3. User klickt Link → Paddle Overlay öffnet sich
   → Server berechnet Preis aus DB neu (NICHT vom Client vertrauen)
   → Paddle-Transaction wird erzeugt

4. Zahlung erfolgreich → Webhook
   → status='paid', payment_status='paid'
   → Bestätigungs-E-Mails (Kunde + Admin)

5. Wenn User binnen 60 Min nicht zahlt → Cron-Job
   → status='rejected' (Spot wieder frei), E-Mail an User "Zahlungsfrist verstrichen"
```

## Datenbank-Änderungen

- `bookings.payment_deadline timestamptz NULL` — Frist nach Admin‑Freigabe
- Neuer Status: `awaiting_admin` ist nicht nötig — `pending` reicht (wie bisher)
- pg_cron Job alle 5 Min: `UPDATE bookings SET status='rejected', payment_status='expired' WHERE status='approved' AND payment_status='unpaid' AND payment_deadline < now()`
- `prevent_booking_overlap` zählt weiterhin `pending`/`approved`/`paid` als Sperrung (unverändert)

## Edge Functions

- **`create-booking-request`** (NEU, ersetzt create-booking-checkout):
  - Lädt spot, extras aus DB, **rechnet total_price serverseitig neu** (Schutz vor Manipulation)
  - Insert booking als `pending/unpaid`, KEIN Paddle-Call
  - Triggert E-Mails (admin_new + user_received)

- **`approve-booking`** (NEU):
  - Admin-only (RBAC check)
  - setzt status='approved', payment_deadline = now() + 60min
  - Triggert E-Mail an User mit Zahlungslink

- **`create-payment-checkout`** (NEU, ersetzt alten Custom-Txn-Teil):
  - User-only, prüft: booking gehört user, status='approved', payment_deadline > now()
  - Berechnet Preis nochmal aus DB (nicht aus Booking-Row, falls manipuliert)
  - Erzeugt Paddle-Transaction → returnt transactionId

- **`payments-webhook`** (UPDATE):
  - bisherige Logik bleibt
  - + neuer Handler `adjustment.created` (action='refund') → setzt status='rejected', payment_status='refunded' → Spot frei

- **`cleanup-expired-bookings`** (NEU, scheduled via pg_cron):
  - Markiert abgelaufene approved/unpaid bookings als rejected/expired
  - Sendet "Frist abgelaufen" E-Mail

- **`send-booking-email`** (UPDATE):
  - Neue Templates: `request_received`, `approved_pay_now`, `payment_expired`, `refunded`

## Frontend

- **BookingSystem.tsx**: „Bezahlen" → „Anfrage senden". Success-Screen: „Wir prüfen deine Anfrage und senden dir innerhalb von 24h einen Zahlungslink per E‑Mail."
- **MyBookings.tsx**:
  - Bei `approved/unpaid` mit aktiver `payment_deadline`: prominenter „Jetzt bezahlen" Button + Countdown
  - Cancel-Button NUR bei `pending` (RLS-konform)
  - Payment-Status-Labels erweitern: `expired`, `refunded`
- **Account.tsx**: liest URL `?pay={id}` → öffnet automatisch Paddle Overlay; `?checkout=success` → Toast + reload
- **AdminBookings/BookingDetail**: 
  - Bei `pending`: Button „Freigeben & Zahlungslink senden" (statt direkt approved setzen)
  - Anzeige `payment_deadline` mit Countdown bei approved/unpaid

## Sicherheit

- ✅ Server-side price recalculation in beiden Edge Functions (verhindert 1€‑Buchungen)
- ✅ Admin‑only Approval mit `has_role` check
- ✅ Payment-Edge prüft Booking‑Owner, Status, Deadline
- ✅ Webhook signature verification (existiert bereits)

## Legal Pages (für Paddle Go‑Live)

Muss ich neue Seiten anlegen: `/agb`, `/widerruf`, `/datenschutz`. Brauche:
- **Legaler Geschäftsname** (oder dein Privatname, falls als Privatperson)
- Adresse für Impressum (existiert evtl. schon)

Refund-Policy formuliere ich Paddle‑konform aber praxisnah:
> „14 Tage Widerrufsrecht für nicht angetretene Buchungen. Ab dem Anreisedatum oder bei Nichtantritt verfällt der Buchungswert. Erstattungsanträge an info@buchtm1.at — Bearbeitung durch Paddle."

So bist du legal sauber, aber faktisch musst du nur erstatten wenn jemand >14 Tage vor Anreise storniert UND noch nicht angereist ist.

## Test‑Anleitung (Preview)

1. **Anfrage stellen**: Als User einloggen → Buchung ausfüllen → „Anfrage senden" → Bestätigung sehen
2. **Admin‑Freigabe**: Als Admin (kevin.hoffmann1@gmx.at) einloggen → /admin → Anfrage öffnen → „Freigeben"
3. **Zahlung**: Als User → /account → „Jetzt bezahlen" → Paddle Overlay → Testkarte:
   - Karte: `4242 4242 4242 4242`
   - CVC: `123`
   - Datum: beliebiges zukünftiges (z.B. 12/30)
4. **Status prüfen**: Buchung sollte automatisch auf „Bezahlt" springen, E‑Mails ankommen
5. **Abbruch testen**: Anfrage stellen → freigeben → 60 Min warten (oder manuell via SQL deadline auf gestern setzen) → Cron sollte sie auf rejected setzen
6. **Refund testen**: Im Paddle Sandbox‑Dashboard → Transaction → Refund → Webhook sollte Buchung als refunded markieren

## Reihenfolge der Implementierung

1. DB‑Migration (payment_deadline + pg_cron)
2. Edge Functions (request/approve/payment/cleanup) + Email‑Templates
3. Webhook erweitern
4. Frontend (BookingSystem, MyBookings, Account, Admin)
5. Legal Pages (sobald du mir den Geschäftsnamen gibst)

---

**Was ich von dir noch brauche:**
1. **Geschäftsname** für die Legal Pages (oder „Privatperson + dein Name")
2. Bestätigung, dass die **Refund‑Policy‑Formulierung oben** für dich passt (Paddle‑konform, faktisch fast keine Erstattungen)
3. Bestätigung der **60 Min Zahlungsfrist nach Admin‑Freigabe** — das ist sehr knapp. 24 Stunden wären realistischer (User checkt evtl. erst abends Mail). Was bevorzugst du?
