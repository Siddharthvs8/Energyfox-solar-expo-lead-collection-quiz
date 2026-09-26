export type PrizeId = "solar5" | "solar10" | "solar15" | "inverter50";

export type Prize = {
  id: PrizeId;
  discount: number;
  /** What the discount applies to. */
  product: string;
};

/** Everything the wheel shows. The odds live server-side in `lib/spin.ts`. */
export const PRIZES: Record<PrizeId, Prize> = {
  solar5: { id: "solar5", discount: 5, product: "solar project" },
  solar10: { id: "solar10", discount: 10, product: "solar project" },
  solar15: { id: "solar15", discount: 15, product: "solar project" },
  inverter50: { id: "inverter50", discount: 50, product: "FoxGrid inverter" },
};

/** Wheel slices, clockwise from the pointer at the top. */
export const WHEEL: PrizeId[] = [
  "solar10",
  "solar5",
  "solar15",
  "inverter50",
  "solar10",
  "solar5",
  "solar15",
  "inverter50",
];

/** Discounts a player can actually win, highest first. */
export const SOLAR_DISCOUNTS = [15, 10, 5] as const;
export const MAX_SOLAR_DISCOUNT = SOLAR_DISCOUNTS[0];

export function prizeLabel(discount: number, prize: PrizeId | null) {
  const product = prize ? PRIZES[prize].product : "solar project";
  return `${discount}% off ${product}`;
}
