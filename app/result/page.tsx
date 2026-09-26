import { redirect } from "next/navigation";
import { PlayerShell } from "@/components/player-shell";
import { formatPhone } from "@/lib/phone";
import { getCurrentLead } from "@/lib/player";
import { PRIZES } from "@/lib/prizes";
import { ResultView } from "./result-view";

export const metadata = { title: "Your reward · Energyfox" };

export default async function ResultPage() {
  const lead = await getCurrentLead();
  if (!lead) redirect("/");
  if (lead.status !== "completed") redirect("/spin");

  return (
    <PlayerShell>
      <ResultView
        name={lead.name}
        phone={formatPhone(lead.phone)}
        discount={lead.discount}
        product={lead.prize ? PRIZES[lead.prize].product : "solar project"}
        coupon={lead.coupon}
      />
    </PlayerShell>
  );
}
