# Roadmap – Änderungswunsch 03.09.2026

## Phase 1 – Texte & Startseite
- [x] Überall "10 Plätze" → "9 Angelplätze mit Hütte" (inkl. Footer, AdvantagesSection)
- [x] Platz 10 in DB deaktivieren
- [x] "Telefonisch buchen" Button/Link entfernen (Booking.tsx); Telefonnummer bleibt auf Kontakt/Impressum/Anfahrt/Footer
- [x] Hinweis Startseite: "Buchungen nur mit Anmeldung möglich"
- [x] Instagram + Facebook Icons im Footer verlinken
- [x] Kontaktname "Wolfgang" bei Telefonnummer

## Phase 2 – Buchungsablauf
- [x] "Mindestaufenthalt 3 Nächte" Text entfernen (Logik bleibt)
- [x] Anzahlung-Hinweis im Buchungsprozess deutlich
- [x] Admin-Freigabe entfällt: Buchung sofort "Vorreserviert", Frist 7 Tage
- [x] Auto-Löschung nach 7 Tagen ohne Anzahlung
- [ ] Admin-Dashboard: direkt "Anzahlung bestätigen"
- [x] Kein Storno-Button bei bestätigter Anzahlung
- [x] Admin kann Buchung manuell eintragen

## Phase 3 – Preislogik (client + server)
- [x] Fischereigebühr +10 €/Tag als eigene Position
- [x] Alleinangler +15 €/Tag
- [x] Kinder <10 = 0 €
- [x] Extra "Hund" +10 € einmalig
- [ ] All-inclusive optional (nicht vorausgewählt), umbenannt "All you can Eat"
- [x] Partikelmix: nur Hinweistext, kein Extra
- [x] Platz 4 & 5: max 2 Personen, keine Begleitpersonen

## Phase 4 – Plätze & Ausstattung
- [ ] Ausstattungs-Icons: Strom, TV, Klima, Heizung, Terrasse, Sitzmöglichkeit, Steg, Sanitär
- [ ] Lageplan-Bild bei Platzauswahl (Bild fehlt noch vom Kunden)
- [ ] Foto + Beschreibung je Platz; Platz 3 "Mit Hütte"; Stockbetten-Hinweis außer Platz 3/4

## Phase 5 – E-Mails
- [x] Buchungsbestätigung: 50 % Anzahlung, IBAN/BIC, 7 Tage Frist, "nicht rückerstattbar"
- [x] Verwendungszweck BM1-045 14.07/2025 (Buchungsnummer)
- [x] Anfahrt in E-Mail
- [x] Wort "Storno" vermeiden

## Phase 6 – Kundendashboard & Kalender
- [x] Status "Vorreserviert"
- [ ] Kalender zeigt vorreserviert + Countdown, "Belegt"

## Phase 7 – Telefon-Verifizierung (Twilio)
- [ ] Twilio Connector verbinden
- [ ] SMS-OTP statt E-Mail-OTP bei Registrierung
- [x] +36 (Ungarn) blockieren mit Hinweis

## Phase 8 – Mehrsprachigkeit
- [x] i18n DE/CS/SK/EN + Sprachumschalter (Kernseiten übersetzt, weitere Seiten folgen)
