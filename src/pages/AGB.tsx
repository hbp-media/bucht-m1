import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AGB = () => {
  return (
    <main className="bg-background">
      <Navbar />
      <section className="pt-32 md:pt-40 pb-20 md:pb-28 px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-accent" />
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">Rechtliches</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.1] mb-12">
          Allgemeine Geschäftsbedingungen
        </h1>

        <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-6">
          <p>Stand: Mai 2026</p>

          <h2 className="font-display text-xl text-foreground pt-4">1. Anbieter</h2>
          <p>
            BuchtM1 (Verein), vertreten durch Obmann Wolfgang Jörg, Külterület 036/7 hrsz ep., H-9221 Level, Ungarn.
            Kontakt: info@buchtm1.at, Tel. +43 699 130 35 163. Im Folgenden „Anbieter" oder „wir".
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">2. Geltungsbereich & Vertragsschluss</h2>
          <p>
            Diese AGB gelten für alle Buchungen von Angelplätzen am Vereinsgewässer BuchtM1. Mit Absenden einer
            Buchungsanfrage gibt der Kunde ein verbindliches Angebot ab. Ein Vertrag kommt erst zustande, nachdem (a) die
            Anfrage durch uns geprüft und freigegeben wurde, (b) sämtliche gewünschten Zusatzleistungen ausgewählt sind
            und (c) die vollständige Zahlung über unseren Zahlungsdienstleister Paddle erfolgt ist. Vor Zahlungsfreigabe
            besteht kein Anspruch auf einen bestimmten Platz oder Termin.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">3. Leistung</h2>
          <p>
            Bereitgestellt wird der gebuchte Angelplatz für den gewählten Zeitraum sowie ggf. gebuchte Zusatzleistungen.
            Es gelten die jeweils auf der Website veröffentlichte Teichordnung sowie die ungarischen Angel- und
            Naturschutzvorschriften.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">4. Preise & Zahlung</h2>
          <p>
            Es gelten die zum Zeitpunkt der Buchung im System angezeigten Preise inkl. ggf. anfallender Steuern. Die
            Bestellabwicklung erfolgt durch unseren Online-Reseller Paddle.com. Paddle.com ist Vertragspartner („Merchant
            of Record") für alle Bestellungen, übernimmt die Zahlungsabwicklung, Rechnungsstellung sowie sämtliche
            Kunden­anfragen zu Bezahlung und Rückerstattungen. Es gelten ergänzend die{" "}
            <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent">
              Paddle Buyer Terms
            </a>
            .
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">5. Stornierung & Rückerstattung</h2>
          <p>
            Es gilt unsere{" "}
            <a href="/widerruf" className="text-primary hover:text-accent">Widerrufs- und Rückerstattungsrichtlinie</a>.
            Anträge auf Rückerstattung sind an info@buchtm1.at zu richten und werden über Paddle abgewickelt.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">6. Pflichten des Kunden</h2>
          <p>
            Der Kunde verpflichtet sich, die Teichordnung einzuhalten (No-Kill, Mikro-Widerhaken, Monofile Schnüre etc.),
            keine rechtswidrigen Handlungen zu setzen, das Gewässer und die Anlage pfleglich zu behandeln und die
            Mindestaltersanforderungen zu erfüllen. Bei Verstößen behalten wir uns Verweis ohne Rückerstattung vor.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">7. Haftung</h2>
          <p>
            Die Nutzung der Anlage erfolgt auf eigene Gefahr. Wir haften nur für Schäden, die auf vorsätzlichem oder grob
            fahrlässigem Verhalten unsererseits beruhen. Die Haftung für leichte Fahrlässigkeit ist – außer bei
            Personenschäden – ausgeschlossen. Eine Haftung für mittelbare Schäden, entgangenen Gewinn oder Datenverlust
            ist ausgeschlossen.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">8. Geistiges Eigentum</h2>
          <p>Alle Inhalte dieser Website (Texte, Bilder, Logos) sind urheberrechtlich geschützt.</p>

          <h2 className="font-display text-xl text-foreground pt-4">9. Aussetzung & Kündigung</h2>
          <p>
            Wir können den Zugang zu unseren Diensten aussetzen oder Buchungen stornieren bei wesentlichem Verstoß gegen
            diese AGB, Nichtzahlung, Sicherheits- oder Betrugsverdacht oder wiederholten Regelverstößen.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">10. Schlussbestimmungen</h2>
          <p>
            Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Sollten einzelne Bestimmungen unwirksam
            sein, bleibt der Rest unberührt.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default AGB;
