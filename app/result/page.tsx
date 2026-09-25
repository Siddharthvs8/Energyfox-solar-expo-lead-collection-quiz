import { redirect } from "next/navigation";
import { PlayerShell } from "@/components/player-shell";
import { query, type Lead } from "@/lib/db";
import { completeIfFinished, liveQuestionIds } from "@/lib/leads";
import { formatPhone } from "@/lib/phone";
import { getCurrentLead } from "@/lib/player";
import { getQuestion, isCorrect } from "@/lib/quiz";
import { ResultView } from "./result-view";

export const metadata = { title: "Your reward · Energyfox" };

export default async function ResultPage() {
  let lead = await getCurrentLead();
  if (!lead) redirect("/");
  if (lead.status !== "completed") {
    if (!(await completeIfFinished(lead, lead.answers))) redirect("/quiz");
    [lead] = await query<Lead>("SELECT * FROM leads WHERE id = $1", [lead.id]);
  }

  const outcomes = liveQuestionIds(lead).map((id) => isCorrect(getQuestion(id)!, lead.answers[id]));

  return (
    <PlayerShell>
      <ResultView
        name={lead.name}
        phone={formatPhone(lead.phone)}
        score={lead.score}
        total={outcomes.length}
        outcomes={outcomes}
        discount={lead.discount}
        coupon={lead.coupon}
      />
    </PlayerShell>
  );
}
