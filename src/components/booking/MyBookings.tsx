import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, MapPin, X, Banknote, Copy, Check, History, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  persons: number;
  total_price: number;
  deposit_amount: number;
  deposit_paid_at: string | null;
  final_payment_due_date: string | null;
  final_paid_at: string | null;
  status: string;
  payment_status: string;
  payment_deadline: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  email: string;
  last_name: string;
  created_at: string;
  spot_id: string;
  fishing_spots: { name: string } | null;
}

interface PaySettings {
  bank_holder: string;
  iban: string;
  bic: string;
  deposit_deadline_hours: number;
  cancellation_days_before: number;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Anfrage prüfen", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  approved: { label: "Anzahlung offen", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Storniert", cls: "bg-red-100 text-red-800 border-red-200" },
  paid: { label: "Bezahlt", cls: "bg-primary/10 text-primary border-primary/20" },
};

const PAY_LABEL: Record<string, string> = {
  unpaid: "Offen",
  deposit_pending: "Anzahlung offen",
  deposit_paid: "Anzahlung erhalten",
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
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

const CopyField = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
        <p className={`text-sm text-foreground truncate ${mono ? "font-mono" : "font-body"}`}>{value || "—"}</p>
      </div>
      <button
        onClick={copy}
        className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        title="Kopieren"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

const PayBlock = ({ booking, settings, mode }: { booking: Booking; settings: PaySettings | null; mode: "deposit" | "final" }) => {
  const remaining = useCountdown(mode === "deposit" ? booking.payment_deadline : null);
  const expired = remaining === "abgelaufen";
  const amount = mode === "deposit"
    ? Number(booking.deposit_amount || 0)
    : Number(booking.total_price) - Number(booking.deposit_amount || 0);
  const reference = `Bucht M1 / ${booking.last_name} / ${booking.id.slice(0, 8)}`;
  const title = mode === "deposit" ? "Anzahlung offen" : "Restzahlung vor Ort";

  // Restzahlung erfolgt vor Ort — keine Überweisung, keine Bankdaten.
  if (mode === "final") {
    return (
      <div className="mt-4 p-4 md:p-5 border border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary" />
            <p className="font-body text-[11px] tracking-[0.2em] uppercase text-primary">{title}</p>
          </div>
          <p className="font-body text-xs text-foreground">
            Betrag: <strong>€{amount.toFixed(2)}</strong>
          </p>
        </div>
        <div className="bg-background border border-border p-3 md:p-4 space-y-2">
          <p className="font-body text-sm text-foreground leading-relaxed">
            Die <strong>Restzahlung von €{amount.toFixed(2)}</strong> wird <strong>bar oder per EC-Karte direkt vor Ort</strong> bei deiner Anreise am{" "}
            <strong>{format(new Date(booking.start_date), "dd.MM.yyyy", { locale: de })}</strong> beglichen.
          </p>
          <p className="font-body text-xs text-muted-foreground leading-relaxed">
            Keine Überweisung nötig. Sobald wir die Zahlung vor Ort erhalten haben, markieren wir deine Buchung als vollständig bezahlt.
          </p>
        </div>
        <div className="flex items-start gap-2 mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p className="font-body text-[11px] leading-relaxed">
            <strong>Wichtig:</strong> Erfolgt die Restzahlung nicht bis zum Check-in, wird die Buchung automatisch storniert und die Anzahlung verfällt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 md:p-5 border border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-primary" />
          <p className="font-body text-[11px] tracking-[0.2em] uppercase text-primary">{title}</p>
        </div>
        {booking.payment_deadline && (
          <p className="font-body text-xs text-foreground">
            Frist: <strong className={expired ? "text-destructive" : ""}>{remaining ?? "—"}</strong>
          </p>
        )}
      </div>
      <div className="bg-background border border-border p-3 md:p-4">
        <CopyField label="Empfänger" value={settings?.bank_holder || "wird noch eingerichtet"} />
        <CopyField label="IBAN" value={settings?.iban || ""} mono />
        <CopyField label="BIC" value={settings?.bic || ""} mono />
        <CopyField label="Betrag" value={`€${amount.toFixed(2)}`} />
        <CopyField label="Verwendungszweck" value={reference} mono />
      </div>
      <p className="font-body text-[11px] text-muted-foreground mt-3 leading-relaxed">
        Bitte den Verwendungszweck genau so angeben — sonst können wir die Zahlung nicht zuordnen.
        Sobald der Betrag bei uns eingeht, bestätigen wir manuell und du erhältst eine E-Mail.
        Hinweis: Die Anzahlung ist <strong>nicht erstattbar</strong> – bei Storno verfällt sie. Die <strong>Restzahlung erfolgt später vor Ort</strong> (bar oder EC).
      </p>
    </div>
  );
};

const buildTimeline = (b: Booking): { ts: string; label: string; tone: string }[] => {
  const items: { ts: string; label: string; tone: string }[] = [];
  items.push({ ts: b.created_at, label: "Anfrage gestellt", tone: "muted" });
  if (b.status === "approved" || b.status === "paid" || b.deposit_paid_at || b.payment_status === "deposit_pending") {
    // approximation: we don't have approved_at, fall back to updated_at when status moves past pending
  }
  if (b.payment_deadline && (b.status === "approved" || b.status === "paid" || b.payment_status === "deposit_pending" || b.payment_status === "deposit_paid" || b.payment_status === "paid")) {
    items.push({ ts: b.payment_deadline, label: "Anzahlungs-Frist", tone: "muted" });
  }
  if (b.deposit_paid_at) {
    items.push({ ts: b.deposit_paid_at, label: "Anzahlung bestätigt", tone: "ok" });
  }
  if (b.final_payment_due_date) {
    items.push({ ts: b.final_payment_due_date, label: "Restzahlung fällig", tone: "muted" });
  }
  if (b.final_paid_at) {
    items.push({ ts: b.final_paid_at, label: "Restzahlung bestätigt", tone: "ok" });
  }
  if (b.status === "rejected") {
    const who =
      b.cancelled_by === "user"
        ? "durch Kunde"
        : b.cancelled_by === "admin"
        ? "durch Admin"
        : b.cancelled_by === "system"
        ? "automatisch (Frist abgelaufen)"
        : "";
    items.push({
      ts: b.cancelled_at || b.created_at,
      label: who ? `Storniert ${who}` : "Storniert / Abgelehnt",
      tone: "bad",
    });
  }
  return items.sort((a, c) => new Date(a.ts).getTime() - new Date(c.ts).getTime());
};

const BookingDashboard = ({ booking, settings, onClose, onCancelRequest }: {
  booking: Booking;
  settings: PaySettings | null;
  onClose: () => void;
  onCancelRequest: (b: Booking) => void;
}) => {
  const cancelDays = settings?.cancellation_days_before ?? 14;
  const startMs = new Date(booking.start_date).getTime();
  const withinFreeWindow = startMs - Date.now() > cancelDays * 86400_000;
  const canCancel =
    booking.status === "pending" ||
    (["deposit_paid", "paid"].includes(booking.payment_status) && booking.status !== "rejected");
  const showDeposit = booking.status === "approved" && booking.payment_status === "deposit_pending";
  const showFinal = booking.payment_status === "deposit_paid" && booking.status !== "rejected";
  const timeline = buildTimeline(booking);
  const deposit = Number(booking.deposit_amount || 0);
  const total = Number(booking.total_price);
  const remaining = total - deposit;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="font-display text-2xl text-foreground">
            {booking.fishing_spots?.name || "Platz"}
          </h3>
          <p className="font-body text-[11px] text-muted-foreground mt-1 font-mono">
            ID: {booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span className={`px-2.5 py-1 font-body text-[10px] tracking-[0.15em] uppercase border ${(STATUS_LABEL[booking.status] || STATUS_LABEL.pending).cls}`}>
          {(STATUS_LABEL[booking.status] || STATUS_LABEL.pending).label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Anreise</p>
          <p className="font-body text-foreground">{format(new Date(booking.start_date), "dd. MMM yyyy", { locale: de })}</p>
        </div>
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Abreise</p>
          <p className="font-body text-foreground">{format(new Date(booking.end_date), "dd. MMM yyyy", { locale: de })}</p>
        </div>
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Personen</p>
          <p className="font-body text-foreground">{booking.persons}</p>
        </div>
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Gesamt</p>
          <p className="font-display text-primary text-base">€{total.toFixed(2)}</p>
        </div>
      </div>

      <div className="border border-border bg-muted/30 p-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Anzahlung</p>
          <p className="font-body text-foreground">
            €{deposit.toFixed(2)}{booking.deposit_paid_at && <span className="text-emerald-700 ml-1">✓</span>}
          </p>
        </div>
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Restzahlung</p>
          <p className="font-body text-foreground">
            €{remaining.toFixed(2)}{booking.final_paid_at && <span className="text-emerald-700 ml-1">✓</span>}
          </p>
        </div>
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Zahl-Status</p>
          <p className="font-body text-foreground">{PAY_LABEL[booking.payment_status] ?? booking.payment_status}</p>
        </div>
      </div>

      {showDeposit && <PayBlock booking={booking} settings={settings} mode="deposit" />}
      {showFinal && <PayBlock booking={booking} settings={settings} mode="final" />}

      <div>
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" /> Verlauf
        </p>
        <ol className="relative border-l border-border ml-2 space-y-3">
          {timeline.map((t, idx) => (
            <li key={idx} className="ml-4">
              <span
                className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-background ${
                  t.tone === "ok" ? "bg-emerald-500" : t.tone === "bad" ? "bg-destructive" : "bg-muted-foreground/50"
                }`}
              />
              <p className="font-body text-sm text-foreground">{t.label}</p>
              <p className="font-body text-[11px] text-muted-foreground">
                {format(new Date(t.ts), "dd.MM.yyyy HH:mm", { locale: de })} Uhr
              </p>
            </li>
          ))}
        </ol>
      </div>

      {canCancel && (
        <div className="pt-4 border-t border-border">
          {booking.status !== "pending" && (
            <div className="flex items-start gap-2 p-3 mb-3 bg-amber-50 border border-amber-200 text-amber-900">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs leading-relaxed">
                Die Anzahlung von €{deposit.toFixed(2)} ist <strong>nicht erstattbar</strong>.
                Bei Stornierung verfällt sie zugunsten der Bucht.
              </p>
            </div>
          )}
          <button
            onClick={() => onCancelRequest(booking)}
            className="flex items-center gap-1.5 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" /> {booking.status === "pending" ? "Anfrage zurückziehen" : "Buchung stornieren"}
          </button>
        </div>
      )}
    </div>
  );
};

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<PaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [bRes, sRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, fishing_spots(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.rpc("get_payment_bank_details"),
    ]);
    setBookings((bRes.data as Booking[]) || []);
    const row = Array.isArray(sRes.data) ? sRes.data[0] : sRes.data;
    setSettings((row as PaySettings) || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const openBooking = useMemo(
    () => bookings.find((x) => x.id === openId) || null,
    [bookings, openId]
  );

  const cancelMeta = useMemo(() => {
    if (!cancelTarget) return null;
    const cancelDays = settings?.cancellation_days_before ?? 14;
    const startMs = new Date(cancelTarget.start_date).getTime();
    const withinFreeWindow = startMs - Date.now() > cancelDays * 86400_000;
    const isPending = cancelTarget.status === "pending";
    return { cancelDays, withinFreeWindow, isPending };
  }, [cancelTarget, settings]);

  const performCancel = async () => {
    if (!cancelTarget) return;
    const b = cancelTarget;
    setCancelTarget(null);
    if (b.status === "pending") {
      const { error } = await supabase.from("bookings").update({ status: "rejected" }).eq("id", b.id);
      if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Zurückgezogen", description: "Deine Anfrage wurde entfernt." });
    } else {
      const { data, error } = await supabase.functions.invoke("cancel-booking-user", {
        body: { bookingId: b.id },
      });
      if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
        return;
      }
      toast({
        title: "Storniert",
        description: data?.late_cancel
          ? "Späte Stornierung – Anzahlung verfällt. Admin wurde informiert."
          : "Deine Buchung wurde storniert.",
      });
    }
    setOpenId(null);
    load();
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
    <>
      <div className="space-y-4">
        {bookings.map((b, i) => {
          const baseStatus = STATUS_LABEL[b.status] || STATUS_LABEL.pending;
          // Klarere Anzeige bei Storno: unterscheide "Storniert – Anzahlung verfallen" vs. einfache Stornierung
          const status =
            b.status === "rejected" && (b.payment_status === "deposit_paid" || b.payment_status === "paid")
              ? { label: "Storniert – Anzahlung verfallen", cls: "bg-red-100 text-red-800 border-red-200" }
              : b.status === "approved" && b.payment_status === "deposit_paid"
                ? { label: "Anzahlung bezahlt – Restzahlung vor Ort", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" }
                : baseStatus;
          const showDeposit = b.status === "approved" && b.payment_status === "deposit_pending";
          const showFinal = b.payment_status === "deposit_paid" && b.status !== "rejected";
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => setOpenId(b.id)}
              className="border border-border bg-card p-5 md:p-6 cursor-pointer hover:border-accent/60 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <h4 className="font-display text-lg text-foreground">
                    {b.fishing_spots?.name || "Platz"}
                  </h4>
                  <span className="font-body text-[10px] text-muted-foreground font-mono ml-1">
                    #{b.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <span className={`px-3 py-1 font-body text-[10px] tracking-[0.15em] uppercase border ${status.cls}`}>
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2 text-sm">
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
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Gesamt</p>
                  <p className="font-display text-primary text-base">€{Number(b.total_price).toFixed(2)}</p>
                </div>
              </div>

              {showDeposit && <div onClick={(e) => e.stopPropagation()}><PayBlock booking={b} settings={settings} mode="deposit" /></div>}
              {showFinal && <div onClick={(e) => e.stopPropagation()}><PayBlock booking={b} settings={settings} mode="final" /></div>}

              <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
                <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span className="font-body text-[11px]">
                      Gestellt am {format(new Date(b.created_at), "dd.MM.yyyy", { locale: de })}
                    </span>
                  </div>
                  <span className="font-body text-[11px]">
                    Status: {PAY_LABEL[b.payment_status] ?? b.payment_status}
                  </span>
                </div>
                <span className="font-body text-[10px] tracking-[0.15em] uppercase text-accent">
                  Details & Verlauf →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Buchungs-Dashboard</DialogTitle>
          </DialogHeader>
          {openBooking && (
            <BookingDashboard
              booking={openBooking}
              settings={settings}
              onClose={() => setOpenId(null)}
              onCancelRequest={(b) => setCancelTarget(b)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cancelMeta?.isPending ? "Anfrage zurückziehen?" : "Buchung stornieren?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelMeta?.isPending && "Deine Anfrage wird entfernt. Das lässt sich nicht rückgängig machen."}
              {!cancelMeta?.isPending && (
                <span className="text-destructive font-medium">
                  Achtung: Die Anzahlung von €{Number(cancelTarget?.deposit_amount || 0).toFixed(2)} ist nicht erstattbar und verfällt mit der Stornierung.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zurück</AlertDialogCancel>
            <AlertDialogAction
              onClick={performCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMeta?.isPending ? "Zurückziehen" : "Stornieren"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyBookings;
