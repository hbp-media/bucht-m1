import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import lakeHero from "@/assets/lake-hero.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const glassY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background image with parallax + slow zoom */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ y: imgY }}>
        <img
          src={lakeHero}
          alt="Aerial view of Bucht M1 private carp fishing lake"
          className="w-full h-[130%] object-cover animate-slow-zoom"
          width={1920}
          height={1080}
        />
      </motion.div>

      {/* Dark gradient overlay */}
      <motion.div className="absolute inset-0 hero-overlay" style={{ opacity: overlayOpacity }} />

      {/* Diagonal accent shape */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-10"
        style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(var(--background)) 100%)",
          clipPath: "polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Floating glass accent – top right */}
      <motion.div
        className="absolute top-32 right-8 md:right-16 w-48 h-48 md:w-64 md:h-64 rounded-2xl glass-panel opacity-30 z-10 hidden md:block"
        style={{ y: glassY }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 0.3, x: 0 }}
        transition={{ duration: 1.5, delay: 2 }}
      />

      {/* Floating glass accent – bottom left */}
      <motion.div
        className="absolute bottom-48 left-8 md:left-16 w-32 h-32 md:w-44 md:h-44 rounded-xl glass-panel opacity-20 z-10 hidden md:block"
        style={{ y: glassY }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ duration: 1.5, delay: 2.3 }}
      />

      {/* Gold diagonal line accent */}
      <div className="absolute top-0 right-[20%] w-px h-[60%] bg-gradient-to-b from-transparent via-accent/20 to-transparent z-10 hidden lg:block" />

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ y: textY }}
      >
        {/* Gold accent line */}
        <motion.div
          className="w-14 h-px gradient-gold mb-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />

        <motion.p
          className="font-body text-xs tracking-[0.4em] uppercase text-accent mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Private Carp Fishing
        </motion.p>

        <motion.h1
          className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-foreground text-shadow-hero leading-[1] max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
        >
          Bucht M1
        </motion.h1>

        <motion.p
          className="font-display text-xl md:text-2xl lg:text-3xl italic text-cream/70 mt-5 max-w-2xl text-shadow-soft"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0 }}
        >
          Carp Fishing auf höchstem Niveau.
        </motion.p>

        <motion.p
          className="font-body text-sm md:text-base text-muted-foreground mt-5 max-w-md tracking-widest uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          Ruhe · Natur · Exklusiver Zugang
        </motion.p>

        <motion.a
          href="#buchen"
          className="mt-12 inline-block px-12 py-4 font-body text-xs tracking-[0.25em] uppercase font-semibold gradient-gold text-primary-foreground rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Jetzt buchen
        </motion.a>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <span className="text-[10px] font-body tracking-[0.4em] uppercase text-muted-foreground">
            Entdecken
          </span>
          <motion.div
            className="w-px h-10 bg-accent/40"
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
