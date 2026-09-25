import { createHash, randomInt } from "node:crypto";
import { QUESTIONS, type Question } from "./questions";
import { QUESTIONS_PER_QUIZ } from "./prizes";

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string) {
  return byId.get(id);
}

/** Picks a fresh random set of questions for a new player. */
export function pickQuestionIds() {
  const ids = QUESTIONS.map((q) => q.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, QUESTIONS_PER_QUIZ);
}

export function correctAnswers(question: Question) {
  return typeof question.answer === "number" ? [question.answer] : [...question.answer].sort((a, b) => a - b);
}

export function isMultiple(question: Question) {
  return correctAnswers(question).length > 1;
}

/** Stored answers are arrays of option indexes (a plain number in older rows). */
export function toChoice(stored: number | number[] | undefined) {
  if (stored === undefined) return [];
  return Array.isArray(stored) ? stored : [stored];
}

/** Right only when exactly the correct options were picked. */
export function isCorrect(question: Question, stored: number | number[] | undefined) {
  const chosen = toChoice(stored);
  const correct = correctAnswers(question);
  return chosen.length === correct.length && correct.every((i) => chosen.includes(i));
}

export function scoreAnswers(questionIds: string[], answers: Record<string, number | number[]>) {
  return questionIds.filter((id) => {
    const question = byId.get(id);
    return question !== undefined && isCorrect(question, answers[id]);
  }).length;
}

/**
 * Display order of a question's options for one player. Shuffled so the
 * right answer isn't always in the same spot, and seeded by the player's
 * secret token so the order stays put if they reload.
 */
export function optionOrder(question: Question, seed: string) {
  const order = question.options.map((_, i) => i);
  if (question.keepOrder) return order;
  const bytes = createHash("sha256").update(`${seed}:${question.id}`).digest();
  for (let i = order.length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
