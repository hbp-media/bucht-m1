import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Startseite", href: "#" },
  { label: "Erlebnis", href: "#erlebnis" },
  { label: "Galerie", href: "#galerie" },
  { label: "Kontakt", href: "#kontakt" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      style={{
        background: scrolled
          ? "hsla(120, 8%, 6%, 0.85)"
          : "linear-gradient(180deg, hsla(0,0%,0%,0.6) 0%, hsla(0,0%,0%,0.25) 60%, transparent 100%)",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid hsla(80, 30%, 35%, 0.15)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:py-5">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-sm gradient-gold flex items-center justify-center">
            <span className="font-display text-sm font-bold text-primary-foreground leading-none">
              M1
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-xl font-bold text-foreground tracking-wide">
              Bucht M1
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#buchen"
            className="ml-4 px-6 py-2.5 font-body text-xs tracking-[0.15em] uppercase font-semibold gradient-gold text-primary-foreground rounded-sm hover:shadow-lg transition-shadow duration-300"
          >
            Jetzt buchen
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Menü"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden panel-glass border-t border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-body text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-gold py-3 border-b border-border/30 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#buchen"
              onClick={() => setMobileOpen(false)}
              className="mt-3 px-6 py-3 text-center font-body text-xs tracking-[0.15em] uppercase font-semibold gradient-gold text-primary-foreground rounded-sm"
            >
              Jetzt buchen
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
