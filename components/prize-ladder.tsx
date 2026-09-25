import { PRIZES, QUESTIONS_PER_QUIZ } from "@/lib/prizes";

export function PrizeLadder({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-3 gap-2.5 ${className}`}>
      {PRIZES.map((prize, i) => {
        const top = i === 0;
        return (
          <li
            key={prize.score}
            className={`relative overflow-hidden rounded-2xl px-2 pt-3 pb-3.5 text-center ${
              top ? "border border-sun-400/60 bg-sun-500/15 shadow-[0_0_30px_-8px_rgb(249_157_28/0.7)]" : "glass"
            }`}
          >
            {top && (
              <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sun-300 to-transparent" />
            )}
            <p className="text-[0.7rem] font-semibold tracking-wide text-white/60 uppercase">
              {prize.score}/{QUESTIONS_PER_QUIZ} correct
            </p>
            <p
              className={`mt-1 font-display text-[1.7rem] leading-none font-bold ${
                top ? "text-sun-gradient" : "text-white"
              }`}
            >
              {prize.discount}%
            </p>
            <p className="mt-1 text-[0.7rem] font-bold tracking-[0.2em] text-sun-300 uppercase">off</p>
          </li>
        );
      })}
    </ul>
  );
}
