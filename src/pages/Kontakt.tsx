import { motion } from "framer-motion";
import { Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Kontakt = () => {
  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-12 h-px bg-accent" />
            <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
              Kontakt
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Wir freuen uns
            <br />
            <span className="italic text-primary">auf dich.</span>
          </motion.h1>

          <motion.p
            className="font-body text-muted-foreground max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Du hast Fragen oder möchtest einen Platz reservieren? Kontaktiere uns – wir sind gerne für dich da.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Facebook */}
            <motion.a
              href="https://www.facebook.com/profile.php?id=61575107498498"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-5 p-6 border border-border/40 hover:border-accent/30 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary group-hover:text-accent transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Social Media</span>
                <p className="font-display text-lg text-foreground mt-1 group-hover:text-primary transition-colors duration-300">Facebook</p>
              </div>
            </motion.a>

            {/* Phone */}
            <motion.a
              href="tel:+436991303516"
              className="group flex items-start gap-5 p-6 border border-border/40 hover:border-accent/30 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Telefon</span>
                <p className="font-display text-lg text-foreground mt-1 group-hover:text-primary transition-colors duration-300">+43 699 130 35 163</p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:info@buchtm1.at"
              className="group flex items-start gap-5 p-6 border border-border/40 hover:border-accent/30 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">E-Mail</span>
                <p className="font-display text-lg text-foreground mt-1 group-hover:text-primary transition-colors duration-300">info@buchtm1.at</p>
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Kontakt;
