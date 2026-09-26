import { redirect } from "next/navigation";
import { PlayerShell } from "@/components/player-shell";
import { getCurrentLead } from "@/lib/player";
import { SpinClient } from "./spin-client";

export const metadata = { title: "Spin & Win · Energyfox" };

export default async function SpinPage() {
  const lead = await getCurrentLead();
  if (!lead) redirect("/");
  if (lead.status === "completed") redirect("/result");

  return (
    <PlayerShell>
      <SpinClient firstName={lead.name.split(" ")[0]} />
    </PlayerShell>
  );
}
