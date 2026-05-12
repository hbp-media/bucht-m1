// Server-side price recalculation. Source of truth — never trust client total_price.

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

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
  extras: Array<{ id?: string; code?: string; quantity?: number }>;
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
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  total_price: number;
}

// Mirrors src/lib/pricing.ts (or equivalent). Keep this in sync with the frontend.
export async function recalculatePrice(
  admin: SupabaseClient,
  input: BookingInput,
): Promise<PricingResult> {
  // 1) Spot
  const { data: spot, error: spotErr } = await admin
    .from('fishing_spots')
    .select('id, price_per_day, accommodation_type, max_persons, active')
    .eq('id', input.spot_id)
    .maybeSingle();
  if (spotErr || !spot) throw new Error('Spot not found');
  if (!spot.active) throw new Error('Spot inactive');
  if (input.persons > spot.max_persons) throw new Error('Too many anglers for spot');

  const spotPricePerDay = Number(spot.price_per_day || 0);

  // 2) License — base × nights, plus extra 24h blocks for free booking mode
  const baseDays = Math.max(1, input.nights);
  const license_price = spotPricePerDay * baseDays + spotPricePerDay * (input.extra_24h_blocks || 0);

  // 3) Accommodation — only if spot supports it
  let accommodation_price = 0;
  let cleaning_price = 0;
  if (input.accommodation_type !== 'none') {
    if (input.accommodation_type !== spot.accommodation_type) {
      throw new Error('Accommodation type not available on this spot');
    }
    // Pauschalpreise (an bestehende Frontend-Logik angelehnt)
    if (input.accommodation_type === 'hut') {
      accommodation_price = 80 * input.nights * Math.max(1, input.accommodation_persons);
      cleaning_price = 30;
    } else if (input.accommodation_type === 'caravan') {
      accommodation_price = 60 * input.nights * Math.max(1, input.accommodation_persons);
      cleaning_price = 25;
    }
  }

  // 4) All inclusive — pro Person pro Nacht
  const all_inclusive_price = input.all_inclusive
    ? 45 * input.nights * (input.persons + (input.companions || 0))
    : 0;

  // 5) Extras — aus DB ziehen
  const extraIds = (input.extras || []).map((e) => e.id).filter(Boolean) as string[];
  let extrasResolved: PricingResult['extras_resolved'] = [];
  let extras_price = 0;
  if (extraIds.length) {
    const { data: rows, error: exErr } = await admin
      .from('extras')
      .select('id, code, name, price, allow_quantity, active')
      .in('id', extraIds);
    if (exErr) throw new Error('Failed to load extras');
    for (const wanted of input.extras) {
      const ex = rows?.find((r: any) => r.id === wanted.id);
      if (!ex || !ex.active) continue;
      const qty = ex.allow_quantity ? Math.max(1, Number(wanted.quantity || 1)) : 1;
      const total = Number(ex.price) * qty;
      extras_price += total;
      extrasResolved.push({
        id: ex.id,
        code: ex.code,
        name: ex.name,
        quantity: qty,
        unit_price: Number(ex.price),
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
    extras_resolved: extrasResolved,
    total_price: round2(total_price),
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
