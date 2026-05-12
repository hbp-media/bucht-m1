// Server-side price recalculation. Mirrors src/lib/pricing.ts exactly.
// Source of truth — never trust client total_price.

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

const PRICES = {
  LICENSE_BASE: 130,
  LICENSE_EXTRA_24H: 40,
  ACCOMMODATION_BASE: 40,
  ACCOMMODATION_EXTRA_PERSON: 10,
  CLEANING_PER_PERSON: 5,
  ALL_INCLUSIVE_PER_PERSON_24H: 15,
  COMPANION_PRICE_PER_24H: 10,
} as const;

export interface BookingInput {
  spot_id: string;
  booking_mode: string;
  nights: number;
  extra_24h_blocks: number;
  persons: number;
  companions: number;
  accommodation_type: string;
  accommodation_persons: number;
  all_inclusive: boolean;
  extras: Array<{ id?: string; quantity?: number }>;
}

export interface PricingResult {
  license_price: number;
  accommodation_price: number;
  cleaning_price: number;
  all_inclusive_price: number;
  extras_price: number;
  extras_resolved: Array<{
    id: string;
    code: string | null;
    name: string;
    unit: string;
    unit_price: number;
    quantity: number;
    total: number;
  }>;
  total_price: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const calcExtra24hBlocks = (nights: number) => (nights <= 3 ? 0 : nights - 3);

const calcExtraTotal = (
  ex: { price: number | string; unit: string },
  ctx: { quantity: number; nights: number },
) => {
  const price = Number(ex.price);
  const qty = Math.max(1, ctx.quantity || 1);
  const nights = Math.max(1, ctx.nights);
  switch (ex.unit) {
    case 'flat': return price;
    case 'per_day':
    case 'per_24h': return price * nights;
    case 'per_kg':
    case 'per_piece': return price * qty;
    default: return price;
  }
};

export async function recalculatePrice(
  admin: SupabaseClient,
  input: BookingInput,
): Promise<PricingResult> {
  const { data: spot, error: spotErr } = await admin
    .from('fishing_spots')
    .select('id, accommodation_type, max_persons, active')
    .eq('id', input.spot_id)
    .maybeSingle();
  if (spotErr || !spot) throw new Error('Spot nicht gefunden');
  if (!spot.active) throw new Error('Spot nicht verfügbar');
  if (input.persons > spot.max_persons) throw new Error('Zu viele Angler für diesen Platz');

  // 1) Lizenz: Wochenend-Basis + Extra-24h-Blöcke
  const license_price =
    PRICES.LICENSE_BASE + calcExtra24hBlocks(input.nights) * PRICES.LICENSE_EXTRA_24H;

  // 2) Unterkunft + Reinigung
  let accommodation_price = 0;
  let cleaning_price = 0;
  if (input.accommodation_type !== 'none') {
    if (input.accommodation_type !== spot.accommodation_type) {
      throw new Error('Unterkunftstyp passt nicht zum Platz');
    }
    if (input.accommodation_persons > 0 && input.nights > 0) {
      const extraPersons = Math.max(0, input.accommodation_persons - 2);
      accommodation_price =
        input.nights * PRICES.ACCOMMODATION_BASE +
        extraPersons * input.nights * PRICES.ACCOMMODATION_EXTRA_PERSON;
      cleaning_price = input.accommodation_persons * PRICES.CLEANING_PER_PERSON;
    }
  }

  // 3) All inclusive (gilt für Angler + Begleitpersonen)
  const totalPersons = input.persons + (input.companions || 0);
  const all_inclusive_price = input.all_inclusive
    ? totalPersons * input.nights * PRICES.ALL_INCLUSIVE_PER_PERSON_24H
    : 0;

  // 4) Begleiter-Pauschale (wird wie ein Extra im Frontend behandelt; hier addiert)
  const companions_price =
    input.companions > 0 && input.nights > 0
      ? input.companions * input.nights * PRICES.COMPANION_PRICE_PER_24H
      : 0;

  // 5) Extras
  const ids = (input.extras || []).map((e) => e.id).filter(Boolean) as string[];
  const extras_resolved: PricingResult['extras_resolved'] = [];
  let extras_price = companions_price; // Begleitkosten in extras_price gebündelt
  if (ids.length) {
    const { data: rows } = await admin
      .from('extras')
      .select('id, code, name, price, unit, allow_quantity, active')
      .in('id', ids);
    for (const wanted of input.extras) {
      const ex = rows?.find((r: any) => r.id === wanted.id);
      if (!ex || !ex.active) continue;
      const qty = ex.allow_quantity ? Math.max(1, Number(wanted.quantity || 1)) : 1;
      const total = calcExtraTotal(ex as any, { quantity: qty, nights: input.nights });
      extras_price += total;
      extras_resolved.push({
        id: ex.id,
        code: ex.code,
        name: ex.name,
        unit: ex.unit,
        unit_price: Number(ex.price),
        quantity: qty,
        total,
      });
    }
  }

  const total_price =
    license_price + accommodation_price + cleaning_price + all_inclusive_price + extras_price;

  return {
    license_price: round2(license_price),
    accommodation_price: round2(accommodation_price),
    cleaning_price: round2(cleaning_price),
    all_inclusive_price: round2(all_inclusive_price),
    extras_price: round2(extras_price),
    extras_resolved,
    total_price: round2(total_price),
  };
}
