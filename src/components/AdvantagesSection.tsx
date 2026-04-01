import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Waves, TreePine, MapPin } from "lucide-react";

const features = [
  {
    icon: Waves,
    title: "Naturbelassenes Gewässer",
    description: "9,6 Hektar unberührte Wasserfläche – ein Paradies für Karpfenangler.",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: TreePine,
    title: "Ruhige Umgebung",
    description: "Abseits vom Trubel. Nur Natur, Vogelgesang und das leise Plätschern des Wassers.",
    accent: "from-accent/15 to-accent/5",
  },
  {
    icon: MapPin,
    title: "Individuelle Angelplätze",
    description: "10 großzügige Spots mit eigenem Steg – jeder Platz ein Rückzugsort.",
    accent: "from-primary/15 to-accent/10",
  },
];

const AdvantagesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-44 overflow-hidden">
      {/* Background with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY }}
      >
        <div className="absolute inset-0 bg-background" />
        {/* Organic radial glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, hsl(var(--olive)), transparent 70%)",
          }}
        />
      </motion.div>

      {/* Diagonal top transition */}
      <div
        className="absolute top-0 left-0 right-0 h-28"
        style={{
          background: "hsl(var(--charcoal))",
          clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 100%)",
        }}
      />

      {/* Fine texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--olive) / 0.4) 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16">
        {/* Section header */}
        <motion.div
          className="mb-24 max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-primary" />
            <span className="text-[11px] font-body tracking-[0.35em] uppercase text-primary font-medium">
              Das Erlebnis
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.92] mb-6">
            Eintauchen in
            <br />
            <span className="italic text-accent">die Natur.</span>
          </h2>
          <p className="font-body text-base text-muted-foreground leading-relaxed max-w-lg">
            Bucht M1 ist mehr als ein Angelgewässer – es ist ein Ort, an dem du die Welt hinter dir lässt.
          </p>
        </motion.div>

        {/* Diagonal overlapping cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 60, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.2,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-60px" }}
              style={{
                marginTop: `${i * 32}px`,
                zIndex: 3 - i,
              }}
            >
              <motion.div
                className="relative bg-card/80 backdrop-blur-sm border border-border/60 rounded-lg p-8 md:p-10 h-full overflow-hidden cursor-default"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Gradient accent top */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${feature.accent} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-600 ease-out`} />

                {/* Background glow on hover */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)",
                  }}
                />

                {/* Icon */}
                <div className="w-14 h-14 rounded-lg bg-secondary/80 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors duration-400">
                  <feature.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4 leading-tight">
                  {feature.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Bottom line */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
