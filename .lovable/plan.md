# Umstellung: Paddle raus, manuelle Überweisung rein

## Neuer Ablauf

```
Kunde bucht ──► status: pending
                  │
                  ▼
Admin gibt frei ──► status: approved
                     • Anzahlung = 50% des Gesamtpreises
                     • Frist: 24h
                     • Mail mit Bankdaten + Betrag + Frist
                     • In-App-Notification
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
  Bezahlt in 24h?      Frist verstrichen
  Admin klickt         → automatisch storniert
  "Anzahlung           (Cron, schon vorhanden)
   erhalten"
       │
       ▼
  status: deposit_paid
       │
       ▼
  X Tage vor Termin: Restzahlung fällig
  (Mail an Kunde, Admin klickt "Restzahlung erhalten")
       │
       ▼
  status: paid
```

**Storno-Regel:** Bis Y Tage vor Termin kostenfrei stornierbar.
Danach verfällt die Anzahlung.

## Was geändert wird

### 1. Datenbank

**Neue Tabelle `payment_settings`** (1-Zeilen-Konfig):
- `bank_holder`, `iban`, `bic` — Bankdaten für Mail
- `deposit_deadline_hours` (Default 24) — Frist für Anzahlung
- `full_payment_days_before` (Default später eintragen, vorerst 14)
- `cancellation_days_before` (Default später eintragen, vorerst 14)
- `deposit_percent` (Default 50)

**Bookings-Tabelle erweitern:**
- `deposit_amount` numeric — berechneter 50%-Betrag
- `deposit_paid_at` timestamp — wann Admin Anzahlung markiert hat
- `final_payment_due_date` date — X Tage vor start_date
- `final_paid_at` timestamp
- Neue `payment_status` Werte: `deposit_pending`, `deposit_paid`, `paid`, `expired`, `refunded`

**Cron-Funktion `expire_unpaid_bookings`** umstellen: prüft jetzt `deposit_pending` + 24h-Frist statt Paddle-Deadline.

### 2. Admin-Bereich

**Neue Seite `/admin` → Tab „Einstellungen"**
- Felder: Kontoinhaber, IBAN, BIC
- Slider/Inputs: Anzahlungs-Frist (h), Restzahlung-Tage-vorher, Storno-Tage-vorher, Anzahlungs-Prozent
- Speichern-Button

**Buchungsdetail (`BookingDetail.tsx`):**
- Paddle-Bezug raus
- Neue Buttons:
  - „Buchung freigeben" (wie bisher, jetzt mit Anzahlungs-Mail)
  - „Anzahlung erhalten" (nach Freigabe)
  - „Restzahlung erhalten" (nach Anzahlung)
  - „Stornieren" (markiert je nach Frist als storniert/refundiert)
- Anzeige: Anzahlungsbetrag, Restbetrag, Fristen, Bezahl-Status

### 3. Kunden-Bereich

**`MyBookings.tsx`:**
- Paddle-Checkout-Button raus
- Stattdessen Status-Anzeige mit Bankdaten + Verwendungszweck (Buchungs-ID)
- Klare Anzeige: „Bitte bis HH:MM überweisen" / „Anzahlung erhalten — Restzahlung bis TT.MM."

### 4. E-Mails (über bestehendes SMTP2GO via `send-booking-email`)

Neue Templates:
- `deposit_request` — bei Freigabe: Bankdaten + Betrag + 24h-Frist
- `deposit_received` — Bestätigung nach Admin-Klick
- `final_payment_request` — X Tage vor Termin
- `final_payment_received` — nach Admin-Klick
- `cancelled_deposit_forfeit` — bei zu später Storno
- `auto_expired` — bei abgelaufener Anzahlungsfrist

### 5. Paddle entfernen

- `src/lib/paddle.ts` — löschen
- `src/components/PaymentTestModeBanner.tsx` — löschen
- `App.tsx`/Layout — Banner-Import raus
- `.env.development` / `.env.production` — `VITE_PAYMENTS_CLIENT_TOKEN` raus
- Edge Functions löschen: `create-booking-checkout`, `create-payment-checkout`, `payments-webhook`
- `bookings.paddle_transaction_id` Spalte: behalten (alte Buchungen referenzieren sie evtl.), aber nicht mehr nutzen
- Paddle-Secrets bleiben in den Connectors (kann der User selbst trennen)

## Was später noch von dir kommt

- Echte Bankdaten (Kontoinhaber, IBAN, BIC)
- Restzahlung-Tage-vorher (Default 14)
- Storno-Tage-vorher (Default 14)
- Wie Restzahlung läuft (Überweisung / bar / Wahl)

→ Default-Werte 14/14 setze ich jetzt, du änderst sie später jederzeit in den Admin-Einstellungen ohne Code-Änderung.

## Reihenfolge der Umsetzung

1. Migration: `payment_settings` Tabelle + `bookings`-Spalten + `payment_status`-Enum erweitern + Cron-Funktion umstellen
2. Admin-Settings-Page bauen
3. `BookingDetail.tsx` umstellen (neue Buttons, Paddle raus)
4. `MyBookings.tsx` umstellen (Bankdaten-Anzeige statt Checkout)
5. `send-booking-email` um neue Templates erweitern
6. `approve-booking` Edge Function: berechnet Anzahlung, setzt 24h-Frist, sendet `deposit_request`
7. Neue Edge Functions: `mark-deposit-paid`, `mark-final-paid`, `cancel-booking-admin`
8. Cron-Job für Restzahlungs-Erinnerung (täglich, prüft `final_payment_due_date`)
9. Paddle-Code & Edge Functions löschen
10. Test-Lauf der ganzen Strecke

Soll ich so loslegen?
