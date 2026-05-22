## Ziel

Buchung deutlich einfacher: nur noch **2 Seiten** ohne "Weiter"-Buttons. Paddle raus, stattdessen automatisierte E-Mail mit IBAN und 24h-Frist; bei Nichtzahlung automatische Stornierung.

## Neuer Buchungsfluss

**Seite 1 – Platz wählen**
- Klick auf Platz → automatischer Wechsel auf Seite 2 (kein "Weiter"-Button mehr)
- Wochenendkarte-Option komplett entfernt
- Fischerhütte ist immer dabei (keine Hütten-Auswahl mehr)

**Seite 2 – Buchung abschließen** (alles auf einer kompakten Seite, kein Scrollen zwingend nötig)
- Links: Kalender (Range-Auswahl, frei wählbarer Zeitraum, min. 3 Nächte)
- Rechts (Sidebar):
  - Personen-Stepper (Angler, Begleitung, Kinder)
  - Extras-Liste (Müll entfernt — ist immer dabei)
  - Kontaktdaten (vorausgefüllt aus Profil)
  - Live-Summe
  - Großer "Anfrage senden"-Button am Ende der Sidebar
- Sobald alle Pflichtfelder ausgefüllt sind, ist der Button aktiv — kein „Weiter" mehr nötig

## Bezahlung — Paddle raus, Überweisung rein

- Paddle-Checkout, Webhooks, alle bezahl-bezogenen Edge Functions entfernen (`create-booking-checkout` vereinfachen, `mark-deposit-paid` bleibt für Admin)
- Neue Logik nach Buchungsanlage:
  1. Buchung wird sofort mit `status = 'pending'`, `payment_status = 'deposit_pending'`, `payment_deadline = now() + 24h` angelegt
  2. Automatische E-Mail an Kunde via SMTP2GO: Anzahlungsbetrag, IBAN/BIC/Empfänger (aus `payment_settings`), Verwendungszweck = Buchungs-ID, 24h-Frist
  3. Admin bekommt In-App-Notification wie bisher
- Admin bestätigt Zahlungseingang manuell im Backend → Status auf `deposit_paid` → zweite E-Mail an Kunde mit Bestätigung + Restzahlungs-Frist

## Auto-Storno nach 24h

- Neue Edge Function `auto-cancel-unpaid-bookings`: setzt alle Buchungen mit `payment_deadline < now()` und `payment_status IN ('unpaid', 'deposit_pending')` auf `status = 'rejected'`, `payment_status = 'expired'`, `cancelled_at = now()`
- pg_cron Job alle 15 Minuten
- Kunde bekommt automatisch eine Storno-E-Mail

## Technische Details

**Frontend-Änderungen**
- `BookingSystem.tsx`: komplett umgebaut auf 2-Schritt-Layout, kein `StepIndicator`/„Weiter"
- `StepMode.tsx`, `StepAccommodation.tsx` entfernt; `StepDates`/`StepExtras`/`StepPersons` weiter genutzt, aber neu komponiert auf einer Seite
- Hütte wird immer auf `accommodation_type = spot.accommodation_type` und `accommodation_persons = totalPersons` gesetzt — keine UI mehr dafür
- Müll-Extra wird aus DB-Query gefiltert (oder per `code = 'muell'` versteckt), Preis aber serverseitig immer addiert

**Backend-Änderungen**
- `create-booking-checkout/index.ts`: Status direkt `pending`+`deposit_pending` setzen, `payment_deadline = now() + 24h`, Anzahlung berechnen, neuen E-Mail-Typ `deposit_request` triggern (existiert schon in `send-booking-email`)
- Neue Edge Function `auto-cancel-unpaid-bookings`
- pg_cron-Job via Supabase Insert-Tool
- Paddle-spezifischer Code raus: `create-booking-checkout` säubern, `_shared/paddle.ts` entfernen, `PADDLE_*` Secrets bleiben unbenutzt (kein Schaden)

**Datenbank**
- Keine Schema-Änderungen nötig (Status `deposit_pending`, `expired`, `payment_deadline` existieren bereits)
- Optional: Müll-Extra in DB als `active = false` markieren oder per Code-Flag verstecken — Vorschlag: per `code = 'muell'` UI-seitig filtern, damit der Preis trotzdem serverseitig fix dabei ist

## Was bleibt unverändert

- Admin-Bereich (Buchungsübersicht, Detail, Notifications)
- Auth, Profile, Sperrtage
- SMTP2GO für E-Mails (schon vorhanden)
- Pricing-Logik in `_shared/booking-pricing.ts` (Müll bleibt im Preis enthalten)
