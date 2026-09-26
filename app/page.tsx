import Link from "next/link";
import { ArrowRight, ScanLine } from "lucide-react";
import { PlayerShell } from "@/components/player-shell";
import { PrizeWheel } from "@/components/prize-wheel";
import { getCurrentLead } from "@/lib/player";
import { MAX_SOLAR_DISCOUNT } from "@/lib/prizes";

export default async function Home() {
  const lead = await getCurrentLead();

  return (
    <PlayerShell>
      <section className="my-auto py-8 text-center">
        <div className="mx-auto w-[70%] max-w-[17rem] animate-fade-up">
          <PrizeWheel />
        </div>
        <p className="mt-10 animate-fade-up text-xs font-bold tracking-[0.25em] text-sun-300 uppercase [animation-delay:60ms]">
          Energyfox Spin &amp; Win
        </p>
        <h1 className="mt-3 animate-fade-up font-display text-4xl leading-tight font-bold [animation-delay:120ms]">
          Scan. Spin.
          <br />
          Win up to <span className="text-sun-gradient">{MAX_SOLAR_DISCOUNT}% off.</span>
        </h1>
        <p className="mx-auto mt-4 flex max-w-sm animate-fade-up items-start gap-2.5 text-left text-white/70 [animation-delay:180ms]">
          <ScanLine className="mt-0.5 size-5 shrink-0 text-sun-300" />
          Visit the Energyfox stall and scan the QR code with your phone camera to get your free spin.
        </p>
        {lead && (
          <Link
            href={lead.status === "completed" ? "/result" : "/spin"}
            className="btn-sun mt-8 flex h-14 animate-fade-up items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition [animation-delay:240ms]"
          >
            {lead.status === "completed" ? "View my reward" : "Spin the wheel"}
            <ArrowRight className="size-5" />
          </Link>
        )}
      </section>
    </PlayerShell>
  );
}
