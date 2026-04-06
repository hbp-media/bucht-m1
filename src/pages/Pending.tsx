import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Pending = () => {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-6 md:px-12 flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-20 h-20 mx-auto mb-8 border border-accent/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-accent" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Konto <span className="italic text-primary">ausstehend</span>
          </h1>

          <p className="font-body text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
            Dein Konto wurde erfolgreich erstellt, muss aber noch freigeschaltet werden.
            Du wirst benachrichtigt, sobald der Zugang aktiviert ist.
          </p>

          <Link
            to="/"
            className="inline-block px-8 py-3 font-body text-xs tracking-[0.2em] uppercase font-semibold border border-border text-foreground hover:border-accent/40 transition-colors duration-300"
          >
            Zur Startseite
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default Pending;
