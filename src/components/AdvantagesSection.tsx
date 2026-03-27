import { motion } from "framer-motion";
import { MapPin, Car, Lock } from "lucide-react";

const features = [
  {
    icon: MapPin,
    number: "10",
    title: "Angelplätze",
    description: "Großzügig angelegte Spots mit eigenem Steg und direktem Seezugang.",
  },
  {
    icon: Car,
    number: "100%",
    title: "Direkt befahrbar",
    description: "Jeder Platz ist bequem mit dem Fahrzeug erreichbar – Equipment direkt am Wasser.",
  },
  {
    icon: Lock,
    number: "24/7",
    title: "Buchungssystem mit Zugang",
    description: "Online reservieren, Zugangscode erhalten, sofort loslegen. Kein Papierkram.",
  },
];

const AdvantagesSection = () => {
  return (
    <section className="relative py-28 md:py-40 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      {/* Diagonal top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: "hsl(var(--charcoal))",
          clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 100%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--olive) / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--olive) / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16">
        {/* Section header */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-primary" />
            <span className="text-[11px] font-body tracking-[0.35em] uppercase text-primary font-medium">
              Auf einen Blick
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95]">
            Alles für deinen
            <br />
            <span className="text-accent italic">perfekten Trip.</span>
          </h2>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-60px" }}
              style={{ marginTop: `${i * 24}px` }}
            >
              <motion.div
                className="relative bg-card border border-border rounded-lg p-8 md:p-10 h-full overflow-hidden cursor-default"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ boxShadow: "var(--shadow-subtle)" }}
              >
                {/* Top olive line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />

                {/* Icon + number row */}
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <feature.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="font-display text-5xl text-border group-hover:text-primary/20 transition-colors duration-500 leading-none">
                    {feature.number}
                  </span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3 leading-tight">
                  {feature.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Bottom accent on hover */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
