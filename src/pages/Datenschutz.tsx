import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Datenschutz = () => {
  return (
    <main className="bg-background">
      <Navbar />
      <section className="pt-32 md:pt-40 pb-20 md:pb-28 px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-accent" />
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">Rechtliches</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.1] mb-12">
          Datenschutzerklärung
        </h1>

        <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-6">
          <h2 className="font-display text-xl text-foreground">1. Verantwortlicher</h2>
          <p>
            BuchtM1 (Verein), Obmann Wolfgang Jörg, Külterület 036/7 hrsz ep., H-9221 Level, Ungarn.
            E-Mail: info@buchtm1.at, Tel. +43 699 130 35 163. Wir sind Verantwortlicher im Sinne der DSGVO für die auf
            dieser Website verarbeiteten personenbezogenen Daten.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">2. Verarbeitete Datenkategorien & Zwecke</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-foreground/80">Kontodaten</strong> (Name, E-Mail, Passwort-Hash) – zur Erstellung
              und Verwaltung Ihres Nutzerkontos. Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
            </li>
            <li>
              <strong className="text-foreground/80">Buchungsdaten</strong> (gewählter Platz, Zeitraum, Zusatzleistungen)
              – zur Abwicklung der Buchung. Rechtsgrundlage: Vertragserfüllung.
            </li>
            <li>
              <strong className="text-foreground/80">Zahlungsdaten</strong> – werden ausschließlich von unserem
              Zahlungsdienstleister Paddle verarbeitet. Wir erhalten lediglich Status und Transaktions-ID.
            </li>
            <li>
              <strong className="text-foreground/80">Kommunikationsdaten</strong> (E-Mail-Anfragen) – zur Beantwortung
              Ihrer Anliegen. Rechtsgrundlage: berechtigtes Interesse (Art. 6 Abs. 1 lit. f) bzw. Vertragsanbahnung.
            </li>
            <li>
              <strong className="text-foreground/80">Server-Logs</strong> (IP-Adresse, Zeitstempel, User-Agent) – zur
              Sicherheit und Betrugsabwehr. Rechtsgrundlage: berechtigtes Interesse.
            </li>
          </ul>

          <h2 className="font-display text-xl text-foreground pt-4">3. Empfänger / Auftragsverarbeiter</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Supabase (Hosting & Datenbank, EU-Region)</li>
            <li>Paddle.com Market Ltd. (Merchant of Record, Zahlungsabwicklung, Steuerkonformität, Rechnungstellung)</li>
            <li>SMTP2GO (E-Mail-Versand für Bestätigungen und OTP-Codes)</li>
            <li>Behörden, soweit gesetzlich verpflichtet</li>
          </ul>

          <h2 className="font-display text-xl text-foreground pt-4">4. Internationale Übermittlung</h2>
          <p>
            Sofern Daten an Empfänger außerhalb des EWR übermittelt werden, geschieht dies auf Grundlage von
            EU-Standardvertragsklauseln oder Angemessenheitsbeschlüssen.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">5. Speicherdauer</h2>
          <p>
            Konto- und Buchungsdaten werden für die Dauer der Geschäftsbeziehung sowie gesetzliche Aufbewahrungsfristen
            (i.d.R. 7 Jahre, § 132 BAO) gespeichert und danach gelöscht oder anonymisiert.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">6. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch
            sowie Widerruf erteilter Einwilligungen. Anfragen richten Sie an info@buchtm1.at. Sie können sich zudem bei
            der österreichischen Datenschutzbehörde (dsb.gv.at) beschweren.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">7. Sicherheit</h2>
          <p>
            Wir setzen technische und organisatorische Maßnahmen ein (TLS-Verschlüsselung, Zugriffskontrollen,
            Row-Level-Security in der Datenbank).
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">8. Cookies</h2>
          <p>
            Wir setzen ausschließlich technisch notwendige Cookies (Session, Authentifizierung) ein. Diese sind für den
            Betrieb erforderlich und benötigen keine Einwilligung.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Datenschutz;
