import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X, User, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import NotificationBell from "@/components/NotificationBell";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const navLinks = [
  { key: "home", href: "/" },
  { key: "rules", href: "/teichordnung" },
  { key: "directions", href: "/anfahrt" },
  { key: "spots", href: "/#plaetze" },
  { key: "contact", href: "/kontakt" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const { t } = useTranslation();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  const isHashLink = (href: string) => href.includes("#") && href.startsWith("/#");

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (isHashLink(href) && location.pathname === "/") {
      const id = href.split("#")[1];
      if (id) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "hsla(40, 20%, 97%, 0.92)"
          : "hsla(40, 20%, 97%, 0.4)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(12px)",
        borderBottom: scrolled ? "1px solid hsla(40, 12%, 85%, 0.5)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-5 md:py-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="font-display text-xl tracking-wide text-foreground">
            Bucht <span className="text-accent italic">M1</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 ml-6">
          {navLinks.map((link) =>
            isHashLink(link.href) && location.pathname !== "/" ? (
              <Link
                key={link.key}
                to={link.href}
                className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                {t(`nav.${link.key}`)}
              </Link>
            ) : isHashLink(link.href) ? (
              <a
                key={link.key}
                href={`#${link.href.split("#")[1]}`}
                onClick={() => handleNavClick(link.href)}
                className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                {t(`nav.${link.key}`)}
              </a>
            ) : (
              <Link
                key={link.key}
                to={link.href}
                className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                {t(`nav.${link.key}`)}
              </Link>
            )
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="p-2 text-muted-foreground hover:text-accent transition-colors duration-300"
              title="Admin"
            >
              <Shield size={18} strokeWidth={1.5} />
            </Link>
          )}

          <LanguageSwitcher />

          {user && <NotificationBell />}

          <Link
            to={user ? "/account" : "/login"}
            className="p-2 text-muted-foreground hover:text-accent transition-colors duration-300"
            title={user ? t("nav.account") : t("nav.login")}
          >
            <User size={18} strokeWidth={1.5} />
          </Link>

          <Link
            to="/booking"
            className="ml-4 px-7 py-2.5 font-body text-[11px] tracking-[0.15em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300"
          >
            {t("nav.book")}
          </Link>
        </nav>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-foreground/70"
          aria-label={t("nav.menu")}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden absolute left-0 right-0 top-full bg-background border-t border-border/30 shadow-lg max-h-[calc(100vh-68px)] overflow-y-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) =>
              isHashLink(link.href) ? (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="font-body text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-accent py-3 border-b border-border/20 transition-colors duration-300"
                >
                  {t(`nav.${link.key}`)}
                </a>
              ) : (
                <Link
                  key={link.key}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-accent py-3 border-b border-border/20 transition-colors duration-300"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              )
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="font-body text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-accent py-3 border-b border-border/20 transition-colors duration-300 flex items-center gap-2"
              >
                <Shield size={16} /> Admin
              </Link>
            )}

            <Link
              to={user ? "/account" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="font-body text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-accent py-3 border-b border-border/20 transition-colors duration-300"
            >
              {user ? t("nav.account") : t("nav.login")}
            </Link>

            <Link
              to="/booking"
              onClick={() => setMobileOpen(false)}
              className="mt-3 px-6 py-3 text-center font-body text-xs tracking-[0.1em] uppercase font-semibold bg-primary text-primary-foreground"
            >
              {t("nav.book")}
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
