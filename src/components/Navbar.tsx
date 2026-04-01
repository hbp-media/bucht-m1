import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Startseite", href: "#" },
  { label: "Plätze", href: "#plaetze" },
  { label: "Buchung", href: "#buchen" },
  { label: "Kontakt", href: "#kontakt" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      style={{
        background: scrolled
          ? "hsla(36, 30%, 96%, 0.9)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid hsla(36, 18%, 82%, 0.5)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-12 py-4 md:py-5">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="font-display text-xs text-primary-foreground leading-none font-medium">M1</span>
          </div>
          <span className={`font-display text-lg transition-colors duration-300 ${scrolled ? "text-foreground" : "text-foreground/80"}`}>
            Bucht M1
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`font-body text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                scrolled
                  ? "text-muted-foreground hover:text-primary"
                  : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#buchen"
            className="ml-4 px-6 py-2.5 font-body text-xs tracking-[0.1em] uppercase font-semibold bg-primary text-primary-foreground rounded-full hover:bg-sage transition-colors duration-300"
          >
            Buchen
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 transition-colors ${scrolled ? "text-foreground" : "text-foreground/70"}`}
          aria-label="Menü"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden bg-background border-t border-border/50"
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
                className="font-body text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-primary py-3 border-b border-border/30 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#buchen"
              onClick={() => setMobileOpen(false)}
              className="mt-3 px-6 py-3 text-center font-body text-xs tracking-[0.1em] uppercase font-semibold bg-primary text-primary-foreground rounded-full"
            >
              Buchen
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
