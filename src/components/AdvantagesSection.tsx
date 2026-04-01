import { motion } from "framer-motion";
import { MapPin, Home, Lock } from "lucide-react";
import lakeHero from "@/assets/lake-hero.jpg";

const features = [
  {
    icon: MapPin,
    number: "01",
    title: "10 Angelplätze",
    description: "Großzügige, voneinander getrennte Spots mit direktem Wasserzugang und eigenem Steg.",
  },
  {
    icon: Home,
    number: "02",
    title: "Fischerhütten",
    description: "Komfortable Unterkünfte direkt am Wasser – für mehrtägige Sessions ausgestattet.",
  },
  {
    icon: Lock,
    number: "03",
    title: "Private Anlage",
    description: "Exklusiver Zugang nur für gebuchte Angler. Keine Tagesgäste, keine Störungen.",
  },
];

const AdvantagesSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left: Content */}
      <div className="relative w-full md:w-[50%] flex items-center px-8 md:px-16 lg:px-24 py-20 md:py-0 order-2 md:order-1">
        {/* Section header */}
        <div className="relative z-10 max-w-lg">
          <motion.div
            className="flex items-center gap-4 mb-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className="w-12 h-px bg-accent" />
            <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
              Das Erlebnis
            </span>
          </motion.div>

          <motion.h2
            className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.1] mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            Mehr als
            <br />
            <span className="italic text-primary">nur Angeln.</span>
          </motion.h2>

          {/* Feature blocks stacked */}
          <div className="space-y-10">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group flex gap-6 cursor-default"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-60px" }}
              >
                {/* Number + line */}
                <div className="flex flex-col items-center pt-1">
                  <span className="font-body text-[10px] tracking-[0.2em] text-accent mb-3">
                    {feature.number}
                  </span>
                  <div className="w-px flex-1 bg-border group-hover:bg-accent/40 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <feature.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    <h3 className="font-display text-lg md:text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Image with reverse diagonal */}
      <div className="relative w-full md:w-[50%] h-[50vh] md:h-auto flex-shrink-0 order-1 md:order-2">
        <div className="absolute inset-0 md:split-diagonal-reverse">
          <img
            src={lakeHero}
            alt="Lake view at Bucht M1"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/80" />
        </div>

        {/* Gold accent line */}
        <motion.div
          className="hidden md:block absolute top-0 left-[12%] w-px h-full bg-accent/15"
          style={{ transform: "skewX(3deg)" }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
        />
      </div>
    </section>
  );
};

export default AdvantagesSection;
