import { query, type Lead } from "./db";
import { discountForScore } from "./prizes";
import { getQuestion, scoreAnswers } from "./quiz";
import { randomCode } from "./random";

/** Question ids still present in the bank (a question may have been removed since the lead started). */
export function liveQuestionIds(lead: Pick<Lead, "question_ids">) {
  return lead.question_ids.filter((id) => getQuestion(id));
}

/**
 * Locks in the score, discount and coupon once every question is answered.
 * Returns true when the lead is (now) completed.
 */
export async function completeIfFinished(lead: Lead, answers: Lead["answers"]) {
  if (lead.status === "completed") return true;
  const ids = liveQuestionIds(lead);
  if (!ids.every((id) => answers[id] !== undefined)) return false;

  const score = scoreAnswers(ids, answers);
  const discount = discountForScore(score);
  for (let attempt = 1; ; attempt++) {
    try {
      await query(
        `UPDATE leads
            SET status = 'completed', score = $2, discount = $3, coupon = $4, completed_at = now()
          WHERE id = $1 AND status = 'playing'`,
        [lead.id, score, discount, discount > 0 ? `EFX-${randomCode(6)}` : null],
      );
      return true;
    } catch (error) {
      // 23505 = unique violation: a coupon code collision, so roll a new one.
      if ((error as { code?: string }).code !== "23505" || attempt >= 3) throw error;
    }
  }
}
