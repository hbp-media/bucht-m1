import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import teichordnungHero from "@/assets/teichordnung-hero.jpg";
import teichordnungCarp from "@/assets/teichordnung-carp.jpg";
import {
  AlertTriangle,
  Check,
  X,
  Fish,
  ShieldAlert,
  Ruler,
  Camera,
  Anchor,
  Tent,
  Flame,
  Scale,
  Droplets,
  Trash2,
  MessageSquareWarning,
  Info,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const ruleIcons = [Fish, Ruler, Scale, Droplets, Anchor, Trash2, MessageSquareWarning];

const Teichordnung = () => {
  const { t } = useTranslation();
  const generalRules = (t("rules.general", { returnObjects: true }) as { title: string; text: string }[]).map(
    (r, i) => ({ ...r, icon: ruleIcons[i] ?? Info }),
  );
  const allowed = t("rules.allowed", { returnObjects: true }) as string[];
  const forbidden = t("rules.forbidden", { returnObjects: true }) as string[];
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.9]);

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      {/* Hero Image */}
      <section ref={heroRef} className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        <motion.img
          src={teichordnungHero}
          alt="Angelgewässer Bucht M1 im Morgennebel"
          className="w-full h-full object-cover will-change-transform"
          width={1920}
          height={640}
          style={{ y: imgY, scale: imgScale }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-8 h-px bg-accent" />
                <span className="font-body text-[11px] tracking-[0.4em] uppercase text-accent/90">
                  {t("rules.eyebrow")}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-white/95 mb-3 drop-shadow-sm">
                {t("rules.title")}
              </h1>
              <p className="font-body text-white/70 text-sm md:text-base max-w-xl leading-relaxed">
{t("rules.intro")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spacer for smooth transition */}
      <div className="h-16 md:h-24" />

      {/* Important Notice */}
      <section className="px-6 md:px-12 pb-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-5 md:p-6 flex gap-4 items-start">
            <AlertTriangle className="text-accent shrink-0 mt-0.5" size={22} />
            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-1">
{t("rules.noticeTitle")}
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
{t("rules.noticeText")}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* General Rules */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
{t("rules.generalTitle")}
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-2">
            {generalRules.map((rule, i) => (
              <motion.div
                key={rule.title}
                className="bg-card border border-border/50 rounded-lg p-5 flex gap-4 items-start hover:shadow-[var(--shadow-card)] transition-shadow duration-300"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <rule.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-body text-sm font-semibold text-foreground mb-1">
                    {rule.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {rule.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catch & Release image banner */}
      <section className="px-6 md:px-12 pb-16">
        <motion.div
          className="max-w-4xl mx-auto rounded-lg overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={teichordnungCarp}
            alt="Karpfen wird schonend zurückgesetzt – Catch & Release"
            className="w-full h-48 md:h-64 object-cover"
            loading="lazy"
            width={1200}
            height={800}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent flex items-end p-6">
            <p className="font-display text-xl md:text-2xl text-foreground">
{t("rules.banner")}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Allowed / Forbidden */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Allowed */}
          <motion.div
            className="bg-card border border-border/50 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary/10 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check size={18} className="text-primary" />
              </div>
              <h2 className="font-display text-xl text-foreground">{t("rules.allowedTitle")}</h2>
            </div>
            <ul className="divide-y divide-border/30">
              {allowed.map((item, i) => (
                <li
                  key={i}
                  className="px-6 py-3.5 flex items-start gap-3 font-body text-sm text-muted-foreground"
                >
                  <Check
                    size={16}
                    className="text-primary shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Forbidden */}
          <motion.div
            className="bg-card border border-border/50 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-destructive/10 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <X size={18} className="text-destructive" />
              </div>
<h2 className="font-display text-xl text-foreground">{t("rules.forbiddenTitle")}</h2>
            </div>
            <ul className="divide-y divide-border/30">
              {forbidden.map((item, i) => (
                <li
                  key={i}
                  className="px-6 py-3.5 flex items-start gap-3 font-body text-sm text-muted-foreground"
                >
                  <X
                    size={16}
                    className="text-destructive shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Liability */}
      <section className="px-6 md:px-12 pb-20">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-secondary border border-border/40 rounded-lg p-5 md:p-6 flex gap-4 items-start">
            <Info className="text-muted-foreground shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-1">
{t("rules.liabilityTitle")}
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
{t("rules.liabilityText")}
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Teichordnung;
