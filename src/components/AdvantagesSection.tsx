import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Anchor, Home, Waves } from "lucide-react";
import waterBg from "@/assets/water-bg.jpg";

const panels = [
  {
    icon: Anchor,
    title: "Private Angelplätze mit Steg",
    description:
      "Exklusiv angelegte Spots mit direktem Zugang – maximale Privatsphäre, minimale Störung.",
  },
  {
    icon: Home,
    title: "Fischerhütten mit Komfort",
    description:
      "Hochwertige Unterkünfte direkt am Ufer. Komfort trifft Natur – ohne Kompromisse.",
  },
  {
    icon: Waves,
    title: "9,6 ha naturbelassenes Gewässer",
    description:
      "Weitläufige, unberührte Wasserfläche inmitten dichter Wälder. Ein Refugium der Stille.",
  },
];

const AdvantagesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 -top-24 -bottom-24" style={{ y: bgY }}>
        <img
          src={waterBg}
          alt=""
          className="w-full h-full object-cover opacity-25"
          loading="lazy"
          width={1920}
          height={1080}
          style={{ filter: "blur(3px)" }}
        />
      </motion.div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--forest)) 50%, hsl(var(--background)) 100%)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-80" />

      {/* Diagonal top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: "hsl(var(--background))",
          clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 100%)",
        }}
      />

      {/* Subtle diagonal lines pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 100px, hsl(var(--gold)) 100px, hsl(var(--gold)) 101px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="h-px w-16 gradient-gold-subtle opacity-50" />
            <span className="text-[10px] font-body tracking-[0.5em] uppercase text-accent">
              Das Erlebnis
            </span>
            <div className="h-px w-16 gradient-gold-subtle opacity-50" />
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground">
            Exklusiv. Natürlich. Privat.
          </h2>
        </motion.div>

        {/* Glass cards in diagonal layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {panels.map((panel, i) => (
            <motion.div
              key={panel.title}
              className="group relative"
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: i * 0.18,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-80px" }}
              style={{ transform: `translateY(${i * 28}px)` }}
            >
              <motion.div
                className="glass-panel rounded-lg p-8 md:p-10 h-full relative overflow-hidden cursor-default"
                whileHover={{
                  y: -8,
                  boxShadow: "var(--shadow-luxury)",
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ boxShadow: "var(--shadow-glass)" }}
              >
                {/* Top gold accent */}
                <div className="absolute top-0 left-0 right-0 h-px gradient-gold opacity-40" />

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ boxShadow: "var(--shadow-glow) inset" }} />

                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-lg gradient-gold-subtle flex items-center justify-center mb-7"
                  whileHover={{ rotate: 3, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <panel.icon className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
                </motion.div>

                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                  {panel.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {panel.description}
                </p>

                {/* Bottom hover accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-600 ease-out" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
