"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import confetti from "canvas-confetti";
import { ArrowRight, CircleAlert, LoaderCircle, PartyPopper, RotateCw, Volume2, VolumeX } from "lucide-react";
import { spinWheel, type SpinResult } from "@/app/actions";
import { PrizeWheel, SLICE_ANGLE, type WheelState } from "@/components/prize-wheel";
import { WHEEL } from "@/lib/prizes";
import { playTick, playWin, unlockAudio } from "@/lib/sfx";

type Win = Extract<SpinResult, { ok: true }>;

const BRAND_COLORS = ["#F99D1C", "#FFC65C", "#FFE3A8", "#FFFFFF", "#2B3B75"];
const EASE = [0.2, 0.8, 0.2, 1] as const;
// Fast launch, then a long, suspenseful slow-down.
const SPIN_EASE = [0.14, 0.72, 0.1, 1] as const;

export function SpinClient({ firstName }: { firstName: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const rotate = useMotionValue(0);
  const pointer = useMotionValue(0);
  const [state, setState] = useState<WheelState>("idle");
  const [winner, setWinner] = useState<number | null>(null);
  const [win, setWin] = useState<Win | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const spinning = useRef(false);
  const lastPeg = useRef(0);
  const idle = useRef<AnimationPlaybackControls | null>(null);

  // Slow drift while waiting, so the wheel feels alive.
  const startIdle = useCallback(() => {
    if (reduceMotion) return;
    const from = rotate.get();
    idle.current = animate(rotate, [from, from + 360], { duration: 45, ease: "linear", repeat: Infinity });
  }, [rotate, reduceMotion]);

  useEffect(() => {
    startIdle();
    return () => idle.current?.stop();
  }, [startIdle]);

  // Each time a peg passes the pointer: flick the pointer and click.
  useMotionValueEvent(rotate, "change", (value) => {
    const peg = Math.floor((value + SLICE_ANGLE / 2) / SLICE_ANGLE);
    if (peg === lastPeg.current) return;
    lastPeg.current = peg;
    if (!spinning.current) return;
    animate(pointer, [-26, 0], { duration: 0.26, ease: [0.2, 0.8, 0.3, 1] });
    if (!mutedRef.current) playTick();
  });

  async function spin() {
    if (spinning.current || state !== "idle") return;
    spinning.current = true;
    unlockAudio();
    setError(null);
    setState("spinning");
    idle.current?.stop();
    navigator.vibrate?.(12);
    router.prefetch("/result");

    // Wind up while the server picks the prize.
    const start = rotate.get();
    const [res] = await Promise.all([
      spinWheel().catch(
        (): SpinResult => ({ ok: false, error: "We couldn't reach the server. Check your connection and try again." }),
      ),
      animate(rotate, start - 18, { duration: 0.5, ease: [0.3, 0, 0.2, 1] }),
    ]);
    if (!res.ok) {
      setError(res.error);
      setState("idle");
      spinning.current = false;
      startIdle();
      return;
    }

    // Land on one of the slices for the prize the server picked, never on a divider.
    const slots = WHEEL.flatMap((id, i) => (id === res.prize ? [i] : []));
    const index = slots[Math.floor(Math.random() * slots.length)];
    const jitter = (Math.random() - 0.5) * SLICE_ANGLE * 0.56;
    const from = rotate.get();
    const rest = (((-index * SLICE_ANGLE + jitter - from) % 360) + 360) % 360;
    await animate(rotate, from + (reduceMotion ? 360 : 360 * 8) + rest, {
      duration: reduceMotion ? 1.2 : 7.4,
      ease: SPIN_EASE,
    });

    spinning.current = false;
    setWinner(index);
    setWin(res);
    setState("won");
    if (!mutedRef.current) playWin();
    navigator.vibrate?.([40, 60, 140]);
    if (!reduceMotion) celebrate();
    setTimeout(() => setRevealed(true), 1300);
  }

  function toggleMute() {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
  }

  return (
    <div className="flex flex-1 flex-col items-center pt-4 pb-2 text-center">
      <div className="flex w-full items-center justify-between">
        <p className="glass rounded-full px-3.5 py-1.5 text-xs font-semibold text-white/85">
          Hi {firstName} 👋 <span className="text-white/40">·</span> <span className="text-sun-200">1 free spin</span>
        </p>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="glass grid size-9 place-items-center rounded-full text-white/70 transition hover:text-white"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mt-6 font-display text-[2.6rem] leading-[1.02] font-bold tracking-tight"
      >
        Spin to <span className="text-sun-gradient">win</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        className="mt-2.5 max-w-xs text-white/70"
      >
        Every spin wins an instant discount on your Energyfox solar project.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -40 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.15 }}
        className="relative mt-11 w-full max-w-[27rem]"
      >
        <PrizeWheel rotate={rotate} pointer={pointer} state={state} winner={winner} onSpin={spin} />
      </motion.div>

      <div className="mt-auto w-full pt-10">
        {state === "won" ? (
          <Link
            href="/result"
            className="btn-sun flex h-15 w-full items-center justify-center gap-2 rounded-2xl text-lg font-bold transition active:scale-[0.98]"
          >
            View my voucher
            <ArrowRight className="size-5" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={spin}
            disabled={state !== "idle"}
            className="btn-sun group relative flex h-15 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-lg font-bold transition active:scale-[0.98] disabled:opacity-90"
          >
            {state === "idle" && (
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/3 animate-sheen bg-linear-to-r from-transparent via-white/45 to-transparent" />
            )}
            {state === "spinning" ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                Good luck, {firstName}…
              </>
            ) : (
              <>
                Spin the wheel
                <RotateCw className="size-5 transition-transform duration-500 group-hover:rotate-180" />
              </>
            )}
          </button>
        )}
        {error && (
          <p role="alert" className="mt-3 flex gap-2.5 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3.5 text-left text-sm text-rose-100">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-white/45">One spin per mobile number</p>
      </div>

      <AnimatePresence>
        {revealed && win && <Reveal firstName={firstName} discount={win.discount} coupon={win.coupon} />}
      </AnimatePresence>
    </div>
  );
}

function Reveal({ firstName, discount, coupon }: { firstName: string; discount: number; coupon: string | null }) {
  const reduceMotion = useReducedMotion();
  const [counted, setCounted] = useState(0);
  const shown = reduceMotion ? discount : counted;

  useEffect(() => {
    if (reduceMotion) return;
    const counter = animate(0, discount, {
      duration: 1.1,
      delay: 0.3,
      ease: "easeOut",
      onUpdate: (v) => setCounted(Math.round(v)),
    });
    return () => counter.stop();
  }, [discount, reduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-navy-950/75 backdrop-blur-md" />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="win-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
        className="relative w-full max-w-lg overflow-hidden rounded-t-[2rem] border border-white/10 bg-linear-to-b from-navy-800 to-navy-950 px-6 pt-9 pb-[max(env(safe-area-inset-bottom),1.75rem)] text-center text-white shadow-2xl sm:rounded-[2rem]"
      >
        <div
          aria-hidden="true"
          className="absolute top-[-55%] left-1/2 size-[150%] -translate-x-1/2 animate-spin-slow opacity-50"
          style={{
            animationDuration: "30s",
            background: "repeating-conic-gradient(rgb(249 157 28 / 0.35) 0deg 6deg, transparent 6deg 18deg)",
            maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)",
          }}
        />
        <div aria-hidden="true" className="absolute top-0 left-1/2 h-44 w-80 -translate-x-1/2 rounded-full bg-sun-500/30 blur-3xl" />

        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-sun-500/15 px-3 py-1 text-xs font-bold tracking-[0.25em] text-sun-200 uppercase ring-1 ring-sun-400/30">
            <PartyPopper className="size-3.5" />
            You won
          </p>
          <p id="win-title" className="mt-4 font-display text-[5.75rem] leading-[0.9] font-extrabold tracking-tight tabular-nums">
            <span className="text-sun-gradient">{shown}%</span>
          </p>
          <p className="mt-1 font-display text-2xl font-bold tracking-[0.4em] text-white">OFF</p>
          <p className="mx-auto mt-3 max-w-xs text-white/75">
            on your Energyfox solar project. Congratulations, {firstName}!
          </p>

          {coupon && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
              className="relative mx-auto mt-6 max-w-xs overflow-hidden rounded-2xl border border-dashed border-sun-400/60 bg-sun-500/10 px-4 py-3"
            >
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-sun-300 uppercase">Coupon code</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em]">{coupon}</p>
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/3 animate-sheen bg-linear-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>
          )}

          <Link
            href="/result"
            className="btn-sun mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-bold transition active:scale-[0.98]"
          >
            View my voucher
            <ArrowRight className="size-5" />
          </Link>
          <p className="mt-3 text-xs text-white/50">Show it at the Energyfox stall to claim your offer.</p>
        </div>
      </motion.section>
    </motion.div>
  );
}

function celebrate() {
  const burst = (options: confetti.Options) =>
    confetti({ colors: BRAND_COLORS, disableForReducedMotion: true, ...options });
  burst({ particleCount: 150, spread: 110, startVelocity: 50, origin: { x: 0.5, y: 0.5 }, scalar: 1.1 });
  const end = Date.now() + 1600;
  (function frame() {
    burst({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } });
    burst({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
