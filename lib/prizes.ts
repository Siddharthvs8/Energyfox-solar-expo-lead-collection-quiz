export const QUESTIONS_PER_QUIZ = 5;

/** Correct answers needed → discount (%). Anything below 3 correct earns 0%. */
export const PRIZES = [
  { score: 5, discount: 15 },
  { score: 4, discount: 10 },
  { score: 3, discount: 5 },
] as const;

export const MAX_DISCOUNT = PRIZES[0].discount;

export function discountForScore(score: number) {
  return PRIZES.find((prize) => score >= prize.score)?.discount ?? 0;
}
