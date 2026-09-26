import { randomInt } from "node:crypto";
import { query, type Lead } from "./db";
import { PRIZES, type PrizeId } from "./prizes";
import { randomCode } from "./random";

/**
 * Chance of each prize, in percent. Server-only, so the odds never reach the
 * browser. 15% off is rare (about 1 spin in 20). The FoxGrid inverter slice is
 * on the wheel for show and is never awarded (0).
 */
const WEIGHTS: Record<PrizeId, number> = {
  solar5: 50,
  solar10: 45,
  solar15: 5,
  inverter50: 0,
};

function drawPrize(): PrizeId {
  const entries = (Object.entries(WEIGHTS) as [PrizeId, number][]).filter(([, weight]) => weight > 0);
  let ticket = randomInt(entries.reduce((sum, [, weight]) => sum + weight, 0));
  for (const [id, weight] of entries) {
    if (ticket < weight) return id;
    ticket -= weight;
  }
  return entries[0][0];
}

/**
 * Spins the wheel for a lead exactly once. Calling it again (a refresh, a
 * double tap, a second device) returns the prize that was already awarded.
 */
export async function spinForLead(lead: Lead): Promise<Lead> {
  if (lead.status === "completed") return lead;

  const prize = PRIZES[drawPrize()];
  for (let attempt = 1; ; attempt++) {
    try {
      const [updated] = await query<Lead>(
        `UPDATE leads
            SET status = 'completed', prize = $2, discount = $3, coupon = $4, completed_at = now()
          WHERE id = $1 AND status <> 'completed'
          RETURNING *`,
        [lead.id, prize.id, prize.discount, `EFX-${randomCode(6)}`],
      );
      if (updated) return updated;
      // Another request spun first; use its result.
      const [current] = await query<Lead>("SELECT * FROM leads WHERE id = $1", [lead.id]);
      return current;
    } catch (error) {
      // 23505 = unique violation: a coupon code collision, so roll a new one.
      if ((error as { code?: string }).code !== "23505" || attempt >= 3) throw error;
    }
  }
}
