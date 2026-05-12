import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Widerruf = () => {
  return (
    <main className="bg-background">
      <Navbar />
      <section className="pt-32 md:pt-40 pb-20 md:pb-28 px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-accent" />
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">Rechtliches</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.1] mb-12">
          Widerrufs- und Rückerstattungsrichtlinie
        </h1>

        <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-6">
          <h2 className="font-display text-xl text-foreground">14-Tage-Widerrufsrecht</h2>
          <p>
            Sie haben das Recht, binnen 14 Tagen ab Bestätigung Ihrer Buchung ohne Angabe von Gründen vom Vertrag
            zurückzutreten – sofern Sie den gebuchten Aufenthalt noch nicht angetreten haben und das Anreisedatum noch
            nicht erreicht ist.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">Erlöschen des Widerrufsrechts</h2>
          <p>
            Da es sich bei Buchungen am Vereinsgewässer um eine Dienstleistung mit fest vereinbartem Termin (Beherbergung
            / Freizeitdienstleistung gemäß § 18 Abs. 1 Z 10 FAGG) handelt, erlischt das Widerrufsrecht mit Beginn des
            gebuchten Zeitraums oder bei Nichtantritt am Anreisetag. Eine Rückerstattung ist nach diesem Zeitpunkt nicht
            mehr möglich.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">Wie Sie eine Rückerstattung beantragen</h2>
          <p>
            Senden Sie eine formlose Mitteilung mit Buchungsnummer an{" "}
            <a href="mailto:info@buchtm1.at" className="text-primary hover:text-accent">info@buchtm1.at</a>. Die
            Bearbeitung und Auszahlung erfolgt durch unseren Zahlungsdienstleister Paddle (
            <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent">
              paddle.net
            </a>
            ), an den Sie sich auch direkt wenden können.
          </p>

          <h2 className="font-display text-xl text-foreground pt-4">Bearbeitung</h2>
          <p>
            Wir prüfen jeden Antrag innerhalb von 5 Werktagen. Berechtigte Erstattungen werden über die ursprüngliche
            Zahlungsmethode rückgebucht.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Widerruf;
