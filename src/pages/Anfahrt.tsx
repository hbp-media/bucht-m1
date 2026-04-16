import Navbar from "@/components/Navbar";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import anfahrtHero from "@/assets/anfahrt-hero.jpg";
import {
  Car,
  Navigation,
  MapPin,
  Phone,
  Mail,
  Facebook,
  ExternalLink,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const bundesstrasseSteps = [
  "A4 – Abfahrt Nickelsdorf nehmen",
  "Richtung Ungarn über den Grenzübergang Nickelsdorf fahren",
  "Durch Hegyeshalom durchfahren",
  "An der nächsten Kreuzung links Richtung Mosonmagyaróvár abbiegen",
  "Durch Levél geradeaus weiterfahren",
  "70 m vor der OMV-Tankstelle rechts in die Gasse Richtung Mosonszolnok einbiegen",
  "Über den Bahnübergang fahren",
  "Direkt nach der Brücke links abbiegen",
  "Dem Feldweg bis zur Einfahrt folgen",
];

const autobahnSteps = [
  "Abfahrt Mosonmagyaróvár nehmen (Vignettenpflicht beachten!)",
  "Immer geradeaus weiterfahren",
  "Durch Levél durchfahren",
  "70 m vor der OMV-Tankstelle rechts Richtung Mosonszolnok abbiegen",
  "Über den Bahnübergang fahren",
  "Direkt nach der Brücke links abbiegen",
  "Dem Feldweg bis zur Einfahrt folgen",
];

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2693.5!2d17.2152559!3d47.8694931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476c7790e1bc009f%3A0x1198416a80da232f!2sBucht%20M1%20carpfishing!5e0!3m2!1sde!2sat!4v1700000000000";
const MAPS_LINK = "https://www.google.com/maps/place/Bucht+M1+carpfishing/@47.8694931,17.2152559,17z";

const Anfahrt = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.9]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image */}
      <section ref={heroRef} className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        <motion.img
          src={anfahrtHero}
          alt="Landstraße zum Angelgewässer Bucht M1"
          className="w-full h-full object-cover will-change-transform"
          width={1920}
          height={640}
          style={{ y: imgY, scale: imgScale }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 md:pb-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-8 h-px bg-accent" />
                <span className="font-body text-[11px] tracking-[0.4em] uppercase text-accent/90">
                  So findest du uns
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white/95 mb-3 drop-shadow-sm">
                Anfahrt
              </h1>
              <p className="font-body text-white/70 max-w-xl text-sm md:text-base leading-relaxed">
                Ob über die Bundesstraße oder die Autobahn – der Weg zu uns ist
                unkompliziert. Hier findest du beide Routen Schritt für Schritt.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spacer for smooth transition */}
      <div className="h-16 md:h-24" />

      {/* Routes */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Bundesstraße */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="rounded-lg border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Car size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground">
                  Bundesstraße
                </h2>
                <p className="font-body text-xs text-muted-foreground tracking-wide uppercase">
                  Mautfrei
                </p>
              </div>
            </div>

            <ol className="space-y-4">
              {bundesstrasseSteps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-xs font-semibold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-body text-sm text-foreground/80 leading-relaxed pt-1">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Autobahn */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="rounded-lg border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Navigation size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground">
                  Autobahn
                </h2>
                <p className="font-body text-xs text-muted-foreground tracking-wide uppercase">
                  Vignettenpflicht
                </p>
              </div>
            </div>

            <ol className="space-y-4">
              {autobahnSteps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-body text-xs font-semibold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-body text-sm text-foreground/80 leading-relaxed pt-1">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-8"
          >
            <span className="inline-block font-body text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Standort
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-foreground">
              Hier findest du uns
            </h2>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="rounded-lg border border-border overflow-hidden shadow-sm"
          >
            <iframe
              src={MAPS_EMBED_URL}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Standort Bucht M1"
              className="w-full"
            />
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mt-6"
          >
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-body text-[11px] tracking-[0.15em] uppercase font-semibold hover:bg-primary/90 transition-colors duration-300"
            >
              <MapPin size={16} />
              Route in Google Maps öffnen
              <ExternalLink size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="rounded-lg border border-border bg-card p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <span className="inline-block font-body text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                Kontakt
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-foreground">
                Fragen zur Anfahrt?
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <a
                href="tel:+4369913035163"
                className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background hover:bg-secondary/50 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone size={20} className="text-primary" />
                </div>
                <span className="font-body text-sm text-foreground font-medium">
                  +43 699 130 35 163
                </span>
                <span className="font-body text-xs text-muted-foreground">
                  Anrufen
                </span>
              </a>

              <a
                href="mailto:info@buchtm1.at"
                className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background hover:bg-secondary/50 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail size={20} className="text-primary" />
                </div>
                <span className="font-body text-sm text-foreground font-medium">
                  info@buchtm1.at
                </span>
                <span className="font-body text-xs text-muted-foreground">
                  E-Mail schreiben
                </span>
              </a>

              <a
                href="https://www.facebook.com/BuchtM1Carpfishing/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background hover:bg-secondary/50 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Facebook size={20} className="text-primary" />
                </div>
                <span className="font-body text-sm text-foreground font-medium">
                  Bucht M1
                </span>
                <span className="font-body text-xs text-muted-foreground">
                  Facebook besuchen
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Anfahrt;
