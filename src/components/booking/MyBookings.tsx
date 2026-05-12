import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, MapPin, X, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initializePaddle, getPaddleEnvironment } from "@/lib/paddle";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  persons: number;
  total_price: number;
  status: string;
  payment_status: string;
  payment_deadline: string | null;
  email: string;
  created_at: string;
  spot_id: string;
  fishing_spots: { name: string } | null;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Anfrage prüfen", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  approved: { label: "Freigegeben – bitte zahlen", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Abgelehnt", cls: "bg-red-100 text-red-800 border-red-200" },
  paid: { label: "Bezahlt", cls: "bg-primary/10 text-primary border-primary/20" },
};

const PAY_LABEL: Record<string, string> = {
  unpaid: "Offen",
  paid: "Bezahlt",
  failed: "Fehlgeschlagen",
  expired: "Frist abgelaufen",
  refunded: "Erstattet",
};

const useCountdown = (deadlineIso: string | null) => {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!deadlineIso) return;
    const i = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, [deadlineIso]);
  if (!deadlineIso) return null;
  const ms = new Date(deadlineIso).getTime() - Date.now();
  if (ms <= 0) return "abgelaufen";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const PayBlock = ({ booking, onPaid }: { booking: Booking; onPaid: () => void }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const remaining = useCountdown(booking.payment_deadline);
  const expired = remaining === "abgelaufen";

  const openCheckout = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-checkout", {
        body: { environment: getPaddleEnvironment(), bookingId: booking.id },
      });
      if (error || !data?.transactionId) {
        throw new Error(error?.message || "Zahlung konnte nicht gestartet werden");
      }
      await initializePaddle();
      window.Paddle.Checkout.open({
        transactionId: data.transactionId,
        customer: { email: booking.email },
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "de",
          successUrl: `${window.location.origin}/account?checkout=success`,
          allowLogout: false,
        },
        eventCallback: (ev: any) => {
          if (ev?.name === "checkout.completed") {
            toast({ title: "Zahlung erfolgreich", description: "Deine Buchung ist gesichert." });
            setTimeout(onPaid, 1500);
          }
          if (ev?.name === "checkout.closed") {
            setBusy(false);
            onPaid();
          }
        },
      });
    } catch (e: any) {
      toast({ title: "Fehler", description: e?.message ?? "Bitte erneut versuchen.", variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-primary/30 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-body text-[11px] tracking-[0.2em] uppercase text-primary mb-1">
          Zahlung erforderlich
        </p>
        <p className="font-body text-sm text-foreground">
          Verbleibende Zeit: <strong>{remaining ?? "—"}</strong>
        </p>
      </div>
      <button
        onClick={openCheckout}
        disabled={busy || expired}
        className="inline-flex items-center gap-2 px-5 py-2.5 font-body text-[11px] tracking-[0.15em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light disabled:opacity-50 transition-colors"
      >
        <CreditCard className="w-3.5 h-3.5" />
        {busy ? "Wird geöffnet..." : expired ? "Frist abgelaufen" : `Jetzt bezahlen · €${Number(booking.total_price).toFixed(2)}`}
      </button>
    </div>
  );
};

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const payIdParam = params.get("pay");
  const checkoutSuccess = params.get("checkout") === "success";

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, fishing_spots(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  // ?checkout=success → toast + clear param
  useEffect(() => {
    if (checkoutSuccess) {
      toast({ title: "Zahlung empfangen", description: "Deine Buchung ist verbindlich gesichert." });
      const next = new URLSearchParams(params);
      next.delete("checkout");
      setParams(next, { replace: true });
      setTimeout(load, 1200);
    }
  }, [checkoutSuccess]);

  // ?pay={id} → automatisch Checkout öffnen für die passende Buchung
  const targetPay = useMemo(
    () => bookings.find((b) => b.id === payIdParam && b.status === "approved" && b.payment_status === "unpaid"),
    [bookings, payIdParam],
  );
  useEffect(() => {
    if (!targetPay) return;
    const next = new URLSearchParams(params);
    next.delete("pay");
    setParams(next, { replace: true });
    // Trigger über Custom Event – PayBlock erkennt es nicht, daher öffnen wir hier:
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("create-payment-checkout", {
          body: { environment: getPaddleEnvironment(), bookingId: targetPay.id },
        });
        if (error || !data?.transactionId) throw new Error(error?.message || "Fehler");
        await initializePaddle();
        window.Paddle.Checkout.open({
          transactionId: data.transactionId,
          customer: { email: targetPay.email },
          settings: {
            displayMode: "overlay", theme: "light", locale: "de",
            successUrl: `${window.location.origin}/account?checkout=success`,
            allowLogout: false,
          },
        });
      } catch (e: any) {
        toast({ title: "Fehler", description: e?.message ?? "", variant: "destructive" });
      }
    })();
  }, [targetPay?.id]);

  const handleCancel = async (id: string) => {
    if (!confirm("Diese Anfrage wirklich zurückziehen?")) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Zurückgezogen", description: "Deine Anfrage wurde entfernt." });
      load();
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground font-body py-8">Lade Buchungen...</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 border border-border bg-card">
        <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.4} />
        <p className="font-body text-sm text-muted-foreground">
          Du hast noch keine Buchungen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((b, i) => {
        const status = STATUS_LABEL[b.status] || STATUS_LABEL.pending;
        const canCancel = b.status === "pending";
        const showPay =
          b.status === "approved" && b.payment_status === "unpaid" && b.payment_deadline;
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="border border-border bg-card p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <h4 className="font-display text-lg text-foreground">
                  {b.fishing_spots?.name || "Platz"}
                </h4>
              </div>
              <span className={`px-3 py-1 font-body text-[10px] tracking-[0.15em] uppercase border ${status.cls}`}>
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Anreise</p>
                <p className="font-body text-foreground">{format(new Date(b.start_date), "dd. MMM yyyy", { locale: de })}</p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Abreise</p>
                <p className="font-body text-foreground">{format(new Date(b.end_date), "dd. MMM yyyy", { locale: de })}</p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Personen</p>
                <p className="font-body text-foreground">{b.persons}</p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Preis</p>
                <p className="font-display text-primary text-base">€{Number(b.total_price).toFixed(2)}</p>
              </div>
            </div>

            {showPay && <PayBlock booking={b} onPaid={load} />}

            <div className="flex items-center justify-between gap-4 pt-4 mt-2 border-t border-border">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span className="font-body text-[11px]">
                    Gestellt am {format(new Date(b.created_at), "dd.MM.yyyy", { locale: de })}
                  </span>
                </div>
                <span className="font-body text-[11px]">
                  Zahlung: {PAY_LABEL[b.payment_status] ?? b.payment_status}
                </span>
              </div>
              {canCancel && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="flex items-center gap-1.5 font-body text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" /> Zurückziehen
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MyBookings;
