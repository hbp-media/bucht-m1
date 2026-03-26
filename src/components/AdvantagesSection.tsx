import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MapPin, Home, TreePine } from "lucide-react";
import waterBg from "@/assets/water-bg.jpg";

const panels = [
  {
    icon: MapPin,
    title: "Exklusive Plätze",
    description:
      "Sorgfältig ausgewählte Angelplätze mit direktem Zugang zum Wasser und maximaler Privatsphäre.",
  },
  {
    icon: Home,
    title: "Komfortable Hütten",
    description:
      "Gemütliche Unterkünfte direkt am Ufer – ausgestattet für ultimativen Komfort in der Natur.",
  },
  {
    icon: TreePine,
    title: "Natur pur",
    description:
      "Eingebettet in unberührte Landschaft, fernab vom Alltag – ein Refugium der Stille.",
  },
];

const AdvantagesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden">
      {/* Background with parallax */}
      <motion.div className="absolute inset-0 -top-20 -bottom-20" style={{ y: bgY }}>
        <img
          src={waterBg}
          alt=""
          className="w-full h-full object-cover opacity-30 blur-sm"
          loading="lazy"
          width={1920}
          height={1080}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 gradient-forest opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {/* Diagonal decorative line */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 80px, hsl(var(--gold)) 80px, hsl(var(--gold)) 81px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-gold/40" />
            <span className="text-xs font-body tracking-[0.4em] uppercase text-gold">
              Warum Bucht M1
            </span>
            <div className="h-px w-12 bg-gold/40" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Ihr exklusives Erlebnis
          </h2>
        </motion.div>

        {/* Diagonal panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {panels.map((panel, i) => (
            <motion.div
              key={panel.title}
              className="group relative"
              initial={{ opacity: 0, y: 60, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-80px" }}
              style={{
                transform: `translateY(${i * 20}px)`,
              }}
            >
              <motion.div
                className="panel-glass rounded-sm p-8 md:p-10 h-full relative overflow-hidden"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 30px 60px -15px hsla(0, 0%, 0%, 0.5)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  boxShadow: "var(--shadow-panel)",
                }}
              >
                {/* Accent top border */}
                <div className="absolute top-0 left-0 right-0 h-px gradient-gold opacity-60" />

                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-sm gradient-gold flex items-center justify-center mb-6"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <panel.icon className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
                </motion.div>

                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {panel.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {panel.description}
                </p>

                {/* Hover accent */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 gradient-gold origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
