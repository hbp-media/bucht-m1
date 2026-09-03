# Roadmap – Änderungswunsch 03.09.2026

## Phase 1 – Texte & Startseite
- [ ] Überall "10 Plätze" → "9 Angelplätze mit Hütte" (inkl. Footer, AdvantagesSection)
- [ ] Platz 10 in DB deaktivieren
- [ ] "Telefonisch buchen" Button/Link entfernen (Booking.tsx); Telefonnummer bleibt auf Kontakt/Impressum/Anfahrt/Footer
- [ ] Hinweis Startseite: "Buchungen nur mit Anmeldung möglich"
- [ ] Instagram + Facebook Icons im Footer verlinken
- [ ] Kontaktname "Wolfgang" bei Telefonnummer

## Phase 2 – Buchungsablauf
- [ ] "Mindestaufenthalt 3 Nächte" Text entfernen (Logik bleibt)
- [ ] Anzahlung-Hinweis im Buchungsprozess deutlich
- [ ] Admin-Freigabe entfällt: Buchung sofort "Vorreserviert", Frist 7 Tage
- [ ] Auto-Löschung nach 7 Tagen ohne Anzahlung
- [ ] Admin-Dashboard: direkt "Anzahlung bestätigen"
- [ ] Kein Storno-Button bei bestätigter Anzahlung
- [ ] Admin kann Buchung manuell eintragen

## Phase 3 – Preislogik (client + server)
- [ ] Fischereigebühr +10 €/Tag als eigene Position
- [ ] Alleinangler +15 €/Tag
- [ ] Kinder <10 = 0 €
- [ ] Extra "Hund" +10 € einmalig
- [ ] All-inclusive optional (nicht vorausgewählt), umbenannt "All you can Eat"
- [ ] Partikelmix: nur Hinweistext, kein Extra
- [ ] Platz 4 & 5: max 2 Personen, keine Begleitpersonen

## Phase 4 – Plätze & Ausstattung
- [ ] Ausstattungs-Icons: Strom, TV, Klima, Heizung, Terrasse, Sitzmöglichkeit, Steg, Sanitär
- [ ] Lageplan-Bild bei Platzauswahl (Bild fehlt noch vom Kunden)
- [ ] Foto + Beschreibung je Platz; Platz 3 "Mit Hütte"; Stockbetten-Hinweis außer Platz 3/4

## Phase 5 – E-Mails
- [ ] Buchungsbestätigung: 50 % Anzahlung, IBAN/BIC, 7 Tage Frist, "nicht rückerstattbar"
- [ ] Verwendungszweck BM1-045 14.07/2025 (Buchungsnummer)
- [ ] Anfahrt in E-Mail
- [ ] Wort "Storno" vermeiden

## Phase 6 – Kundendashboard & Kalender
- [ ] Status "Vorreserviert"
- [ ] Kalender zeigt vorreserviert + Countdown, "Belegt"

## Phase 7 – Telefon-Verifizierung (Twilio)
- [ ] Twilio Connector verbinden
- [ ] SMS-OTP statt E-Mail-OTP bei Registrierung
- [ ] +36 (Ungarn) blockieren mit Hinweis

## Phase 8 – Mehrsprachigkeit
- [ ] i18n DE/CS/SK/EN, Sprachumschalter, komplette Übersetzung
