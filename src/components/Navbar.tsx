import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Startseite", href: "#" },
  { label: "Highlights", href: "#highlights" },
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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      style={{
        background: scrolled ? "hsla(0, 0%, 4%, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <a href="#" className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-foreground">
          Bucht M1
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#buchen"
            className="ml-4 px-6 py-2.5 font-body text-xs tracking-[0.1em] uppercase font-semibold bg-primary text-primary-foreground rounded-full hover:brightness-110 transition-all duration-300"
          >
            Buchen
          </a>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Menü"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border"
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
                className="font-body text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground py-3 border-b border-border/30 transition-colors duration-300"
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
