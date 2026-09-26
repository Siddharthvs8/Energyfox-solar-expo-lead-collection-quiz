import Link from "next/link";
import { ArrowRight, Gift, QrCode, Trophy } from "lucide-react";
import { switchPlayer } from "@/app/actions";
import { PlayerShell } from "@/components/player-shell";
import { PrizeWheel } from "@/components/prize-wheel";
import { query, type Campaign } from "@/lib/db";
import { getCurrentLead } from "@/lib/player";
import { MAX_SOLAR_DISCOUNT } from "@/lib/prizes";
import { RegisterForm } from "./register-form";

export default async function PlayPage({ params }: PageProps<"/play/[code]">) {
  const code = (await params).code.toLowerCase();

  // Every visit to this page is a QR scan.
  const [campaign] = await query<Pick<Campaign, "id" | "active">>(
    "UPDATE campaigns SET scans = scans + 1 WHERE code = $1 RETURNING id, active",
    [code],
  );

  if (!campaign || !campaign.active) {
    return (
      <PlayerShell>
        <section className="my-auto animate-fade-up py-10 text-center">
          <div className="glass mx-auto grid size-20 place-items-center rounded-3xl">
            <QrCode className="size-9 text-sun-300" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">
            {campaign ? "This contest is paused" : "QR code not recognised"}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-white/70">
            Please scan the QR code displayed at the Energyfox stall, or ask our team for help.
          </p>
        </section>
      </PlayerShell>
    );
  }

  const lead = await getCurrentLead();
  if (lead) {
    const done = lead.status === "completed";
    const firstName = lead.name.split(" ")[0];
    return (
      <PlayerShell>
        <section className="my-auto animate-fade-up py-10">
          <div className="glass rounded-3xl p-7 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-sun-500/15 ring-1 ring-sun-400/40">
              {done ? <Trophy className="size-8 text-sun-300" /> : <Gift className="size-8 text-sun-300" />}
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold">Welcome back, {firstName}!</h1>
            <p className="mt-2 text-white/70">
              {done
                ? lead.discount > 0
                  ? `You've already spun and won ${lead.discount}% off.`
                  : "You've already taken part."
                : "Your free spin is waiting for you."}
            </p>
            <Link
              href={done ? "/result" : "/spin"}
              className="btn-sun mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition"
            >
              {done ? "View my reward" : "Spin the wheel"}
              <ArrowRight className="size-5" />
            </Link>
          </div>
          <form action={switchPlayer.bind(null, code)} className="mt-5 text-center">
            <button className="text-sm text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white">
              Not {firstName}? Register a different number
            </button>
          </form>
        </section>
      </PlayerShell>
    );
  }

  return (
    <PlayerShell
      headerRight={
        <span className="glass rounded-full px-3 py-1.5 text-xs font-semibold text-sun-200">🎡 Spin &amp; Win</span>
      }
    >
      <section className="pt-7 pb-7 text-center">
        <div className="mx-auto w-[64%] max-w-[16rem] animate-fade-up">
          <PrizeWheel />
        </div>
        <h1 className="mt-9 animate-fade-up font-display text-[2.4rem] leading-[1.04] font-bold tracking-tight [animation-delay:80ms]">
          Spin the wheel.
          <br />
          Win up to <span className="text-sun-gradient">{MAX_SOLAR_DISCOUNT}% off.</span>
        </h1>
        <p className="mx-auto mt-3.5 max-w-sm animate-fade-up text-[1.02rem] text-white/75 [animation-delay:160ms]">
          Register for your free spin and unlock an instant discount on your Energyfox solar project.
        </p>
      </section>

      <section className="animate-fade-up [animation-delay:240ms]">
        <RegisterForm code={code} />
        <p className="mt-4 px-2 text-center text-xs leading-relaxed text-white/50">
          One spin per mobile number. By continuing, you agree that Energyfox may contact you about solar
          offers.
        </p>
      </section>
    </PlayerShell>
  );
}
