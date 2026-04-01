import { motion } from "framer-motion";
import { Waves, TreePine, MapPin } from "lucide-react";

const features = [
  {
    icon: Waves,
    title: "Naturbelassenes Gewässer",
    description: "9,6 Hektar unberührte Wasserfläche – ein Paradies für Karpfenangler.",
    image: "🌊",
  },
  {
    icon: TreePine,
    title: "Ruhige Umgebung",
    description: "Abseits vom Trubel. Nur Natur, Vogelgesang und das leise Plätschern des Wassers.",
    image: "🌿",
  },
  {
    icon: MapPin,
    title: "Individuelle Angelplätze",
    description: "10 großzügige Spots mit eigenem Steg – jeder Platz ein Rückzugsort.",
    image: "📍",
  },
];

const AdvantagesSection = () => {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden bg-background">
      {/* Soft organic blob accents */}
      <div
        className="absolute top-20 -left-40 w-[500px] h-[500px] opacity-[0.06] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
      />
      <div
        className="absolute bottom-20 -right-40 w-[400px] h-[400px] opacity-[0.04] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="inline-block font-body text-[11px] tracking-[0.4em] uppercase text-primary mb-5">
            Das Erlebnis
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-5">
            Eintauchen in
            <br />
            <span className="italic text-primary">die Natur.</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Bucht M1 ist mehr als ein Angelgewässer – es ist ein Ort, an dem du die Welt hinter dir lässt.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.div
                className="group bg-card rounded-2xl p-8 md:p-9 h-full border border-border/50 cursor-default relative overflow-hidden"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Hover glow */}
                <div
                  className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)" }}
                />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-7 group-hover:bg-primary/15 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>

                  <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 leading-snug">
                    {feature.title}
                  </h3>

                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
