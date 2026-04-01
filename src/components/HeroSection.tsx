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
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.9]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ y: imgY }}>
        <img
          src={lakeHero}
          alt="Aerial view of Bucht M1 private carp fishing lake"
          className="w-full h-[130%] object-cover animate-slow-zoom"
          width={1920}
          height={1080}
        />
      </motion.div>

      {/* Dynamic overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: overlayOpacity,
          background: "linear-gradient(170deg, hsla(80, 20%, 6%, 0.7) 0%, hsla(40, 20%, 4%, 0.85) 50%, hsla(40, 15%, 3%, 0.95) 100%)",
        }}
      />

      {/* Organic shape accent */}
      <div
        className="absolute top-0 right-0 w-[60%] h-full z-[3] hidden lg:block opacity-40"
        style={{
          background: "radial-gradient(ellipse at 70% 30%, hsl(var(--olive) / 0.12), transparent 60%)",
        }}
      />

      {/* Diagonal bottom cut */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44 z-10"
        style={{
          background: "hsl(var(--background))",
          clipPath: "polygon(0 55%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-[4] overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${25 + i * 25}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-start justify-center h-full px-6 md:px-16 lg:px-24 max-w-7xl mx-auto"
        style={{ y: textY }}
      >
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="w-12 h-px bg-primary" />
          <span className="font-body text-[11px] tracking-[0.4em] uppercase text-primary font-medium">
            Natur. Ruhe. Erlebnis.
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-6xl md:text-8xl lg:text-[9rem] font-normal text-foreground text-shadow-hero leading-[0.88] mb-5"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.6, ease: "easeOut" }}
        >
          Dein Platz
          <br />
          <span className="italic text-accent">am Wasser.</span>
        </motion.h1>

        <motion.p
          className="font-display text-lg md:text-xl lg:text-2xl text-muted-foreground mb-3 max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Bucht M1 – Natur. Ruhe. Erlebnis.
        </motion.p>

        <motion.p
          className="font-body text-sm md:text-base text-muted-foreground/70 max-w-md mb-14 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          Reserviere deinen Spot und erlebe Angeln neu.
        </motion.p>

        <motion.a
          href="#buchen"
          className="group inline-flex items-center gap-3 px-12 py-4 font-body text-xs tracking-[0.25em] uppercase font-semibold bg-primary text-primary-foreground rounded-sm hover:bg-olive-light transition-all duration-400 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="relative z-10">Jetzt buchen</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.a>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-24 left-6 md:left-16 lg:left-24 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
        >
          <motion.div
            className="w-px h-14 bg-primary/30"
            animate={{ scaleY: [0.2, 1, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[10px] font-body tracking-[0.35em] uppercase text-muted-foreground/50">
            Entdecken
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
