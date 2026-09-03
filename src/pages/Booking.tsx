import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOnlineBooking = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/booking-system");
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
                Reservierung
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Platz <span className="italic text-primary">buchen</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
              Reserviere deinen Angelplatz bequem online. Buchungen sind nur mit Anmeldung möglich.
            </p>
          </motion.div>

          {/* Options */}
          <div className="max-w-md mx-auto">
            {/* Online */}
            <motion.button
              onClick={handleOnlineBooking}
              className="group relative w-full p-10 border border-border hover:border-accent/40 transition-all duration-500 text-center cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 border border-accent/20 flex items-center justify-center group-hover:border-accent/50 transition-colors duration-300">
                <Globe className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-xl text-foreground mb-3">
                Online buchen
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Nutze unser Buchungssystem und reserviere bequem online.
              </p>
              <span className="inline-block px-8 py-3 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300">
                Zum Buchungssystem
              </span>
            </motion.button>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Booking;
