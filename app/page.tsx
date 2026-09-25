import Link from "next/link";
import { ArrowRight, ScanLine } from "lucide-react";
import { PlayerShell } from "@/components/player-shell";
import { PrizeLadder } from "@/components/prize-ladder";
import { getCurrentLead } from "@/lib/player";
import { MAX_DISCOUNT, QUESTIONS_PER_QUIZ } from "@/lib/prizes";

export default async function Home() {
  const lead = await getCurrentLead();

  return (
    <PlayerShell>
      <section className="my-auto py-10 text-center">
        <div className="relative mx-auto grid size-28 animate-fade-up place-items-center">
          <div className="absolute inset-0 animate-pulse-glow rounded-[2rem] bg-sun-500/25 blur-xl" />
          <div className="glass relative grid size-28 place-items-center rounded-[2rem] animate-float">
            <ScanLine className="size-12 text-sun-300" strokeWidth={1.6} />
          </div>
        </div>
        <p className="mt-8 animate-fade-up text-xs font-bold tracking-[0.25em] text-sun-300 uppercase [animation-delay:60ms]">
          Energyfox Solar Quiz
        </p>
        <h1 className="mt-3 animate-fade-up font-display text-4xl leading-tight font-bold [animation-delay:120ms]">
          Scan. Answer {QUESTIONS_PER_QUIZ}.<br />
          Win up to <span className="text-sun-gradient">{MAX_DISCOUNT}% off.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm animate-fade-up text-white/70 [animation-delay:180ms]">
          Visit the Energyfox stall and scan the QR code with your phone camera to take the quiz.
        </p>
        <PrizeLadder className="mt-8 animate-fade-up text-left [animation-delay:240ms]" />
        {lead && (
          <Link
            href={lead.status === "completed" ? "/result" : "/quiz"}
            className="btn-sun mt-8 flex h-14 animate-fade-up items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition [animation-delay:300ms]"
          >
            {lead.status === "completed" ? "View my reward" : "Continue my quiz"}
            <ArrowRight className="size-5" />
          </Link>
        )}
      </section>
    </PlayerShell>
  );
}
