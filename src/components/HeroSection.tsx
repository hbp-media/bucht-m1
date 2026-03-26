import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import lakeHero from "@/assets/lake-hero.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background image with parallax + slow zoom */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: imgY }}
      >
        <img
          src={lakeHero}
          alt="Aerial view of Bucht M1 carp fishing lake"
          className="w-full h-[130%] object-cover animate-slow-zoom"
          width={1920}
          height={1080}
        />
      </motion.div>

      {/* Dark overlay with gradient */}
      <motion.div
        className="absolute inset-0 hero-overlay"
        style={{ opacity: overlayOpacity }}
      />

      {/* Decorative diagonal line */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ y: textY }}
      >
        {/* Small accent line */}
        <motion.div
          className="w-12 h-px bg-gold mb-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />

        <motion.p
          className="font-body text-sm tracking-[0.35em] uppercase text-gold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Premium Carp Fishing
        </motion.p>

        <motion.h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground text-shadow-hero leading-[1.05] max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
        >
          Bucht M1
        </motion.h1>

        <motion.p
          className="font-display text-xl md:text-2xl lg:text-3xl italic text-cream/80 mt-4 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0 }}
        >
          Carp Fishing auf höchstem Niveau
        </motion.p>

        <motion.p
          className="font-body text-base md:text-lg text-muted-foreground mt-6 max-w-lg tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          Erleben Sie Ruhe, Natur und exklusives Angelerlebnis.
        </motion.p>

        <motion.a
          href="#buchen"
          className="mt-10 inline-block px-10 py-4 font-body text-sm tracking-[0.2em] uppercase font-semibold gradient-gold text-primary-foreground rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-500"
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
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
        >
          <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">
            Entdecken
          </span>
          <motion.div
            className="w-px h-8 bg-gold/50"
            animate={{ scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
