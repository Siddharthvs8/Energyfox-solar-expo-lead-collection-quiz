import { redirect } from "next/navigation";
import { PlayerShell } from "@/components/player-shell";
import { getCurrentLead } from "@/lib/player";
import { correctAnswers, getQuestion, isMultiple, optionOrder, toChoice } from "@/lib/quiz";
import { liveQuestionIds } from "@/lib/leads";
import { QuizClient, type QuizQuestion } from "./quiz-client";

export const metadata = { title: "Solar Quiz · Energyfox" };

export default async function QuizPage() {
  const lead = await getCurrentLead();
  if (!lead) redirect("/");
  if (lead.status === "completed") redirect("/result");

  // Correct answers are only sent for questions the player has already answered.
  const questions: QuizQuestion[] = liveQuestionIds(lead).map((id) => {
    const q = getQuestion(id)!;
    const stored = lead.answers[id];
    return {
      id,
      question: q.question,
      multiple: isMultiple(q),
      options: optionOrder(q, lead.token).map((index) => ({ index, text: q.options[index] })),
      answered: stored === undefined ? null : { choice: toChoice(stored), answer: correctAnswers(q), fact: q.fact },
    };
  });

  return (
    <PlayerShell>
      <QuizClient firstName={lead.name.split(" ")[0]} questions={questions} />
    </PlayerShell>
  );
}
