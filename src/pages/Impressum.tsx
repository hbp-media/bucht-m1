import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Impressum = () => {
  return (
    <main className="bg-background">
      <Navbar />

      <section className="pt-32 md:pt-40 pb-20 md:pb-28 px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-accent" />
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
            Rechtliches
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.1] mb-12">
          Impressum
        </h1>

        <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-6">
          <p className="text-foreground/80">
            Informationspflicht laut §5 E-Commerce Gesetz, §14 Unternehmensgesetzbuch, §63 Gewerbeordnung und Offenlegungspflicht laut §25 Mediengesetz.
          </p>

          <div className="space-y-1">
            <p className="font-display text-lg text-foreground">BuchtM1</p>
          </div>

          <div className="space-y-1">
            <p className="text-foreground/70 font-semibold">Organschaftliche Vertreter</p>
            <p>Obmann: Wolfgang Jörg</p>
          </div>

          <div className="space-y-1">
            <p className="text-foreground/70 font-semibold">Vereinssitz</p>
            <p>Külterület 036/7 hrsz ep.,</p>
            <p>H-9221 Level</p>
            <p>Ungarn</p>
          </div>

          <div className="space-y-1">
            <p className="text-foreground/70 font-semibold">Kontakt</p>
            <p>
              Tel.:{" "}
              <a href="tel:+436991303516" className="text-primary hover:text-accent transition-colors duration-300">
                +43 699 130 35 163
              </a>
            </p>
            <p>
              E-Mail:{" "}
              <a href="mailto:info@buchtm1.at" className="text-primary hover:text-accent transition-colors duration-300">
                info@buchtm1.at
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Impressum;
