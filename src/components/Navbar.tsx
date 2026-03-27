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
          ? "hsla(40, 12%, 6%, 0.92)"
          : "linear-gradient(180deg, hsla(0,0%,0%,0.4) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid hsla(80, 30%, 38%, 0.1)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16 py-4 md:py-5">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
            <span className="font-display text-sm text-primary-foreground leading-none">M1</span>
          </div>
          <span className="font-display text-xl text-foreground tracking-wide">
            Bucht M1
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`font-body text-xs tracking-[0.18em] uppercase transition-colors duration-300 ${
                scrolled
                  ? "text-muted-foreground hover:text-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#buchen"
            className="ml-4 px-7 py-2.5 font-body text-xs tracking-[0.15em] uppercase font-semibold bg-primary text-primary-foreground rounded-sm hover:bg-olive-light transition-colors duration-300"
          >
            Buchen
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
          className="md:hidden bg-card border-t border-border"
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
                className="font-body text-sm tracking-[0.12em] uppercase text-muted-foreground hover:text-primary py-3 border-b border-border/30 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#buchen"
              onClick={() => setMobileOpen(false)}
              className="mt-3 px-6 py-3 text-center font-body text-xs tracking-[0.15em] uppercase font-semibold bg-primary text-primary-foreground rounded-sm"
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
