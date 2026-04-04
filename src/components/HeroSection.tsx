import { motion } from "framer-motion";
import lakeHero from "@/assets/lake-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left: Image with diagonal edge */}
      <div className="relative w-full md:w-[55%] h-[50vh] md:h-screen flex-shrink-0">
        <div className="absolute inset-0 split-diagonal md:split-diagonal">
          <img
            src={lakeHero}
            alt="Cinematic lake view at Bucht M1"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          {/* Dark overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/95" />
        </div>

        {/* Gold accent line on diagonal edge */}
        <motion.div
          className="hidden md:block absolute top-0 right-[6%] w-px h-full bg-accent/20"
          style={{ transform: "skewX(-3deg)" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Right: Content */}
      <div className="relative w-full md:w-[45%] flex items-center md:pl-0 px-8 md:px-16 py-16 md:py-0">
        {/* Subtle background accent */}
        <div
          className="absolute top-1/4 -left-20 w-64 h-64 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(var(--olive)), transparent 70%)" }}
        />

        <div className="relative z-10 max-w-lg">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-4 mb-10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-12 h-px bg-accent" />
            <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
              Private Carp Fishing
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display text-5xl md:text-6xl lg:text-7xl font-medium text-foreground leading-[1.05] mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            Bucht
            <br />
            <span className="italic text-primary">M1</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="font-display text-xl md:text-2xl text-foreground/70 mb-4 italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Carp Fishing auf höchstem Niveau.
          </motion.p>

          {/* Supporting text */}
          <motion.p
            className="font-body text-sm text-muted-foreground max-w-sm mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            Reserviere deinen exklusiven Angelplatz.
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#buchen"
            className="inline-flex items-center gap-4 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <span className="px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300">
              Jetzt buchen
            </span>
            <motion.div
              className="w-12 h-12 border border-accent/30 flex items-center justify-center group-hover:border-accent/60 transition-colors duration-300"
              whileHover={{ x: 4 }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
              </svg>
            </motion.div>
          </motion.a>
        </div>
      </div>

      {/* Vertical scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-8 md:left-12 z-20 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="w-px h-16 bg-accent/20 relative overflow-hidden">
          <motion.div
            className="w-full bg-accent absolute top-0"
            style={{ height: "30%" }}
            animate={{ y: ["0%", "233%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground rotate-0">
          Scroll
        </span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
