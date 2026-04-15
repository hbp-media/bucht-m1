import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import teichordnungHero from "@/assets/teichordnung-hero.jpg";
import teichordnungCarp from "@/assets/teichordnung-carp.jpg";
import {
  AlertTriangle,
  Check,
  X,
  Fish,
  ShieldAlert,
  Ruler,
  Camera,
  Anchor,
  Tent,
  Flame,
  Scale,
  Droplets,
  Trash2,
  MessageSquareWarning,
  Info,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const generalRules = [
  {
    icon: Fish,
    title: "Hakenpflicht",
    text: "Ausschließlich Mikro-Widerhaken verwenden. Haken nur mit Zange aus dem Fischmaul entfernen.",
  },
  {
    icon: Ruler,
    title: "Schnurstärke",
    text: "Hauptschnur ab 0,33 mm Mono. Mindestens 20 m Vorfach in 0,50 mm Mono vorspannen. Nur Montagen mit gesichertem Bleiverlust erlaubt.",
  },
  {
    icon: Scale,
    title: "Wiegen & Zurücksetzen",
    text: "Fische nur in der Wiegeschlinge (110 cm) aus dem Wasser heben, wiegen und zurücksetzen – immer über der Carp Cradle. Flossen dürfen nicht geknickt werden.",
  },
  {
    icon: Droplets,
    title: "Desinfektion",
    text: "Klinikum zur Wunddesinfektion der Fische ist vorgeschrieben.",
  },
  {
    icon: Anchor,
    title: "Angeln sichern",
    text: "Beim Verlassen des Platzes müssen alle Angeln eingezogen werden.",
  },
  {
    icon: Trash2,
    title: "Sauberkeit",
    text: "Der Angelplatz ist sauber zu hinterlassen. Müllentsorgung durch uns ist kostenpflichtig. Bitte die vorgesehenen Toiletten nutzen.",
  },
  {
    icon: MessageSquareWarning,
    title: "Aufsicht & Anweisungen",
    text: "Den Anweisungen des Aufsehers ist jederzeit Folge zu leisten.",
  },
];

const allowed = [
  { icon: Check, text: "Angeln mit bis zu 3 Ruten" },
  { icon: Check, text: "Nachtfischen erlaubt" },
  { icon: Check, text: "Fischen, solange die Anlage eisfrei ist" },
  { icon: Check, text: "Drillen vom Boot nur im Notfall" },
  { icon: Check, text: "Fotos nur kniend über der Carp Cradle oder im Wasser" },
  { icon: Check, text: "Auslegen mit Boot oder Futterboot (Desinfektion durch uns)" },
  { icon: Check, text: "Nur Stabbojen erlaubt" },
  { icon: Check, text: "Karpfenköder nur mit Haarmontage" },
  { icon: Check, text: "Nur unsere Partikel zum Anfüttern" },
  { icon: Check, text: "Schirme & Pavillons ausschließlich in Grün" },
  { icon: Check, text: "Gasgrill erlaubt" },
];

const forbidden = [
  { icon: X, text: "Keine Fischentnahme – reines Catch & Release" },
  { icon: X, text: "Geflochtene Haupt- und Schlagschnüre verboten" },
  { icon: X, text: "Kein eigener Motor, Kescher, Carp Cradle oder Wiegesack" },
  { icon: X, text: "Fische nicht ins Boot heben – im Kescher seitlich ans Ufer bringen" },
  { icon: X, text: "Fische niemals auf den Bauch legen" },
  { icon: X, text: "Einsacken & Hältern ausnahmslos verboten – sofort versorgen und zurücksetzen" },
  { icon: X, text: "Kein Fischen bei übermäßigem Alkoholkonsum" },
  { icon: X, text: "Holzkohlegrill und offenes Feuer verboten" },
];

const Teichordnung = () => {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      {/* Hero with image */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={teichordnungHero}
            alt="Angelgewässer Bucht M1 im Morgennebel"
            className="w-full h-full object-cover"
            width={1920}
            height={640}
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block font-body text-[11px] tracking-[0.25em] uppercase text-accent mb-4">
              Bucht M1
            </span>
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              Teichordnung
            </h1>
            <p className="font-body text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Allgemeine Informationen & Regeln ab 2024 – für ein respektvolles
              Miteinander und den Schutz unseres Gewässers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="px-6 md:px-12 pb-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-5 md:p-6 flex gap-4 items-start">
            <AlertTriangle className="text-accent shrink-0 mt-0.5" size={22} />
            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-1">
                Wichtiger Hinweis
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Anzahlungen werden nicht rückerstattet. Bei Regelverstößen,
                Fischdiebstahl oder Vandalismus wird die Fischerlaubnis sofort
                und ohne Rückerstattung entzogen. Zivilrechtliche Schritte
                bleiben vorbehalten.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* General Rules */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Allgemeine Regeln
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-2">
            {generalRules.map((rule, i) => (
              <motion.div
                key={rule.title}
                className="bg-card border border-border/50 rounded-lg p-5 flex gap-4 items-start hover:shadow-[var(--shadow-card)] transition-shadow duration-300"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <rule.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-body text-sm font-semibold text-foreground mb-1">
                    {rule.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {rule.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catch & Release image banner */}
      <section className="px-6 md:px-12 pb-16">
        <motion.div
          className="max-w-4xl mx-auto rounded-lg overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={teichordnungCarp}
            alt="Karpfen wird schonend zurückgesetzt – Catch & Release"
            className="w-full h-48 md:h-64 object-cover"
            loading="lazy"
            width={1200}
            height={800}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent flex items-end p-6">
            <p className="font-display text-xl md:text-2xl text-foreground">
              Catch & Release – Respekt für jeden Fisch
            </p>
          </div>
        </motion.div>
      </section>

      {/* Allowed / Forbidden */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Allowed */}
          <motion.div
            className="bg-card border border-border/50 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary/10 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check size={18} className="text-primary" />
              </div>
              <h2 className="font-display text-xl text-foreground">Erlaubt</h2>
            </div>
            <ul className="divide-y divide-border/30">
              {allowed.map((item, i) => (
                <li
                  key={i}
                  className="px-6 py-3.5 flex items-start gap-3 font-body text-sm text-muted-foreground"
                >
                  <Check
                    size={16}
                    className="text-primary shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Forbidden */}
          <motion.div
            className="bg-card border border-border/50 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-destructive/10 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <X size={18} className="text-destructive" />
              </div>
              <h2 className="font-display text-xl text-foreground">
                Nicht erlaubt
              </h2>
            </div>
            <ul className="divide-y divide-border/30">
              {forbidden.map((item, i) => (
                <li
                  key={i}
                  className="px-6 py-3.5 flex items-start gap-3 font-body text-sm text-muted-foreground"
                >
                  <X
                    size={16}
                    className="text-destructive shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Liability */}
      <section className="px-6 md:px-12 pb-20">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-secondary border border-border/40 rounded-lg p-5 md:p-6 flex gap-4 items-start">
            <Info className="text-muted-foreground shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-1">
                Haftungsausschluss
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Für Schäden oder Unfälle jeglicher Art wird keine Haftung
                übernommen. Eltern haften für ihre Kinder.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Teichordnung;
