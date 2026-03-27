import { motion } from "framer-motion";
import { MapPin, Maximize, Lock } from "lucide-react";

const highlights = [
  { icon: MapPin, label: "10 Spots", description: "Sorgfältig positioniert für maximale Ruhe." },
  { icon: Maximize, label: "9,6 Hektar", description: "Weitläufige Wasserfläche, endlose Möglichkeiten." },
  { icon: Lock, label: "Private Anlage", description: "Exklusiver Zugang. Keine Öffentlichkeit." },
];

const AdvantagesSection = () => {
  return (
    <section id="highlights" className="relative py-32 md:py-44 overflow-hidden">
      {/* Diagonal background */}
      <div
        className="absolute inset-0 bg-card"
        style={{ clipPath: "polygon(0 8%, 100% 0, 100% 92%, 0 100%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="font-body text-xs tracking-[0.5em] uppercase text-primary mb-4">
            Highlights
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Auf einen Blick.
          </h2>
        </motion.div>

        {/* Feature blocks with staggered diagonal offset */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              viewport={{ once: true, margin: "-80px" }}
              style={{ transform: `translateY(${i * 24}px)` }}
            >
              <div className="relative p-8 md:p-10 rounded-2xl bg-secondary/50 border border-border hover:border-primary/20 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_hsla(145,40%,48%,0.08)]">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {item.label}
                </h3>

                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
