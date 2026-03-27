import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import lakeHero from "@/assets/lake-hero.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ y: imgY }}>
        <img
          src={lakeHero}
          alt="Aerial view of Bucht M1 private carp fishing lake"
          className="w-full h-[125%] object-cover animate-slow-zoom"
          width={1920}
          height={1080}
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Diagonal cut at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-10"
        style={{
          background: "hsl(var(--background))",
          clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Diagonal accent stripe */}
      <div
        className="absolute top-0 right-0 w-[45%] h-full z-[5] hidden lg:block"
        style={{
          background: "linear-gradient(160deg, hsla(80, 30%, 38%, 0.08) 0%, transparent 60%)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* Thin olive accent line */}
      <div
        className="absolute top-0 left-[55%] w-px h-[70%] z-10 hidden lg:block"
        style={{
          background: "linear-gradient(180deg, transparent, hsl(var(--olive) / 0.3), transparent)",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-start justify-center h-full px-6 md:px-16 lg:px-24 max-w-7xl mx-auto"
        style={{ y: textY }}
      >
        {/* Small label */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="w-10 h-px bg-primary" />
          <span className="font-body text-[11px] tracking-[0.35em] uppercase text-primary font-medium">
            Private Carp Fishing
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-7xl md:text-8xl lg:text-[8.5rem] font-normal text-foreground text-shadow-hero leading-[0.9] mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        >
          Bucht M1
        </motion.h1>

        <motion.p
          className="font-display text-xl md:text-2xl lg:text-3xl italic text-accent/90 mb-4 max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Exklusive Angelplätze online reservieren.
        </motion.p>

        <motion.p
          className="font-body text-sm md:text-base text-muted-foreground max-w-md mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          Klare Struktur. Ruhige Umgebung. Maximale Kontrolle.
        </motion.p>

        <motion.a
          href="#buchen"
          className="inline-flex items-center gap-3 px-10 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground rounded-sm hover:bg-olive-light transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Jetzt Platz sichern
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.a>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-20 left-6 md:left-16 lg:left-24 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="w-px h-12 bg-primary/40"
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[10px] font-body tracking-[0.3em] uppercase text-muted-foreground">
            Scroll
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
