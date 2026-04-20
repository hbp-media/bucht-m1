// Hilfen für den "Wochenende"-Modus: Freitag → Sonntag (3 Nächte).
import { addDays, getDay } from "date-fns";
import type { DateRange } from "react-day-picker";

// Liefert für einen beliebigen Stichtag den nächsten Freitag (>= heute).
export const nextFriday = (from: Date = new Date()): Date => {
  const day = getDay(from); // 0=So, 5=Fr
  const diff = (5 - day + 7) % 7;
  return addDays(from, diff);
};

// Standard-Wochenende: Fr → So (3 Nächte → entspricht 72h).
export const buildWeekendRange = (friday: Date): DateRange => {
  return { from: friday, to: addDays(friday, 3) };
};
