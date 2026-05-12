import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Startseite", href: "/" },
  { label: "Angelplätze", href: "/#plaetze" },
  { label: "Teichordnung", href: "/teichordnung" },
  { label: "Anfahrt", href: "/anfahrt" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Impressum", href: "/impressum" },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-xl tracking-wide">
              Bucht <span className="text-accent italic">M1</span>
            </Link>
            <p className="font-body text-sm text-background/50 mt-4 leading-relaxed max-w-xs">
              Exklusives Karpfenangeln in Ungarn. 10 Plätze, 9.6 Hektar, privater Zugang.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-background/40 mb-5 block">
              Navigation
            </span>
            <nav className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-body text-sm text-background/60 hover:text-accent transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-background/40 mb-5 block">
              Kontakt
            </span>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+436991303516"
                className="font-body text-sm text-background/60 hover:text-accent transition-colors duration-300"
              >
                +43 699 130 35 163
              </a>
              <a
                href="mailto:info@buchtm1.at"
                className="font-body text-sm text-background/60 hover:text-accent transition-colors duration-300"
              >
                info@buchtm1.at
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61575107498498"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-background/60 hover:text-accent transition-colors duration-300"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-background/40">
            © BuchtM1.at 2026
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/impressum" className="font-body text-xs text-background/40 hover:text-accent transition-colors duration-300">
              Impressum
            </Link>
            <Link to="/agb" className="font-body text-xs text-background/40 hover:text-accent transition-colors duration-300">
              AGB
            </Link>
            <Link to="/widerruf" className="font-body text-xs text-background/40 hover:text-accent transition-colors duration-300">
              Widerruf
            </Link>
            <Link to="/datenschutz" className="font-body text-xs text-background/40 hover:text-accent transition-colors duration-300">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
