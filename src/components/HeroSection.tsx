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
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={ref} className="relative h-[90vh] md:h-screen overflow-hidden">
      {/* Background with parallax + zoom */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: imgY, scale: imgScale }}
      >
        <img
          src={lakeHero}
          alt="Peaceful lake view at Bucht M1"
          className="w-full h-[120%] object-cover"
          width={1920}
          height={1080}
        />
      </motion.div>

      {/* Soft warm overlay fading to background */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Curved bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 60C240 120 480 120 720 80C960 40 1200 60 1440 90V120H0V60Z" fill="hsl(36, 30%, 96%)" />
        </svg>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6 max-w-4xl mx-auto"
        style={{ y: textY }}
      >
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="inline-block font-body text-[11px] tracking-[0.5em] uppercase text-primary bg-background/60 backdrop-blur-sm px-5 py-2 rounded-full border border-primary/20">
            Private Carp Fishing
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-foreground leading-[1] mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          Dein Platz
          <br />
          <span className="italic text-primary">am Wasser.</span>
        </motion.h1>

        <motion.p
          className="font-display text-lg md:text-xl text-foreground/70 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Bucht M1 – Natur. Ruhe. Erlebnis.
        </motion.p>

        <motion.p
          className="font-body text-sm md:text-base text-muted-foreground max-w-md mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
        >
          Reserviere deinen Spot und erlebe Angeln neu.
        </motion.p>

        <motion.a
          href="#buchen"
          className="inline-flex items-center gap-3 px-10 py-4 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-sage transition-colors duration-300 shadow-lg hover:shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Jetzt buchen
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.a>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1.5"
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
