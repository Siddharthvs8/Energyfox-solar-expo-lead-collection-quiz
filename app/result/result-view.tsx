"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { Camera, MapPin, PhoneCall } from "lucide-react";
import { LogoMark } from "@/components/logo";

const BRAND_COLORS = ["#F99D1C", "#FFC65C", "#FFE3A8", "#FFFFFF", "#34D399"];
const EASE = [0.2, 0.8, 0.2, 1] as const;


// Half-circle cut-outs where the two halves of the ticket meet.
const notch = (edge: "top" | "bottom") => {
  const y = edge === "bottom" ? "100%" : "0";
  const mask = `radial-gradient(circle at 0 ${y}, transparent 13px, #000 13.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% ${y}, transparent 13px, #000 13.5px) right / 51% 100% no-repeat`;
  return { mask, WebkitMask: mask };
};

export function ResultView({
  name,
  phone,
  discount,
  product,
  coupon,
}: {
  name: string;
  phone: string;
  discount: number;
  product: string;
  coupon: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const [counted, setCounted] = useState(0);
  const shown = reduceMotion ? discount : counted;
  const firstName = name.split(" ")[0];
  const won = discount > 0;

  useEffect(() => {
    if (reduceMotion) return;
    const counter = animate(0, discount, {
      duration: 1.6,
      delay: 0.35,
      ease: "easeOut",
      onUpdate: (v) => setCounted(Math.round(v)),
    });
    return () => counter.stop();
  }, [discount, reduceMotion]);

  useEffect(() => {
    if (!won || reduceMotion) return;
    let stopped = false;
    const end = Date.now() + (discount >= 15 ? 2600 : 1600);
    const timer = setTimeout(function frame() {
      if (stopped) return;
      confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors: BRAND_COLORS });
      confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors: BRAND_COLORS });
      if (Date.now() < end) requestAnimationFrame(frame);
    }, 900);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [won, discount, reduceMotion]);

  return (
    <div className="flex flex-1 flex-col items-center pt-4 pb-4 text-center">
      {/* Medallion */}
      <div className="relative mt-2 grid size-60 place-items-center">
        <div
          className={`absolute inset-0 animate-spin-slow rounded-full ${won ? "opacity-70" : "opacity-25"}`}
          style={{
            animationDuration: "40s",
            background: "repeating-conic-gradient(rgb(249 157 28 / 0.55) 0deg 5deg, transparent 5deg 15deg)",
            maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          }}
        />
        {won && (
          <div
            className="absolute inset-8 animate-pulse-glow rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgb(255 198 92 / 0.8), transparent 70%)" }}
          />
        )}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 13, delay: 0.1 }}
          className={`relative grid size-40 place-items-center rounded-full border bg-navy-900/85 ${
            won
              ? "border-sun-300/50 shadow-[0_0_70px_-8px_rgb(249_157_28/0.85)]"
              : "border-white/15 shadow-[0_0_40px_-12px_rgb(255_255_255/0.3)]"
          }`}
        >
          <div>
            <p
              className={`font-display text-[3.6rem] leading-none font-extrabold tabular-nums ${
                won ? "text-sun-gradient" : "text-white/85"
              }`}
            >
              {shown}%
            </p>
            <p className="mt-1.5 text-sm font-bold tracking-[0.4em] text-sun-200 uppercase">off</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
      >
        <h1 className="font-display text-[1.75rem] leading-tight font-bold text-balance">
          {won ? `Congratulations, ${firstName}! 🎉` : `Thanks for taking part, ${firstName}!`}
        </h1>
        <p className="mt-2 text-white/70">
          {won ? (
            <>
              You won <strong className="text-white">{discount}% off</strong> your Energyfox {product}.
            </>
          ) : (
            "Our solar experts will be in touch with the best offer for your home."
          )}
        </p>
      </motion.div>

      {/* Voucher */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 25 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease: EASE }}
        className="mt-7 w-full text-left text-navy-800 drop-shadow-[0_24px_40px_rgb(0_0_0/0.45)]"
      >
        <div className="rounded-t-3xl bg-linear-to-br from-sun-50 via-white to-sun-100 px-6 pt-5 pb-6" style={notch("bottom")}>
          <div className="flex items-center justify-between">
            <p className="text-[0.7rem] font-bold tracking-[0.25em] text-sun-700 uppercase">Energyfox Expo Offer</p>
            <LogoMark className="size-7" />
          </div>
          {won ? (
            <>
              <p className="mt-3 font-display text-5xl leading-none font-extrabold tracking-tight">
                {discount}% <span className="text-sun-500">OFF</span>
              </p>
              <p className="mt-2 text-sm font-medium text-navy-500">on your Energyfox {product}</p>
            </>
          ) : (
            <>
              <p className="mt-3 font-display text-2xl leading-tight font-bold">No discount this time</p>
              <p className="mt-2 text-sm font-medium text-navy-500">
                But our solar experts will still reach out with the best offer for your home.
              </p>
            </>
          )}
        </div>
        <div className="rounded-b-3xl border-t-2 border-dashed border-navy-100 bg-white px-6 pt-5 pb-6" style={notch("top")}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-navy-400">Name</dt>
              <dd className="mt-0.5 truncate font-semibold">{name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-navy-400">Mobile</dt>
              <dd className="mt-0.5 font-semibold whitespace-nowrap">{phone}</dd>
            </div>
          </dl>
          {coupon && (
            <div className="mt-4 rounded-2xl bg-navy-800 px-4 py-3 text-center">
              <p className="text-[0.65rem] font-bold tracking-[0.25em] text-sun-300 uppercase">Coupon code</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.18em] text-white">{coupon}</p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="mt-6 w-full space-y-2.5 text-left text-sm text-white/75"
      >
        {won && (
          <li className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-sun-300" />
            Show this screen at the Energyfox stall to claim your offer.
          </li>
        )}
        <li className="flex gap-3">
          <PhoneCall className="mt-0.5 size-4 shrink-0 text-sun-300" />
          Our solar expert will call you on {phone}.
        </li>
        {won && (
          <li className="flex gap-3">
            <Camera className="mt-0.5 size-4 shrink-0 text-sun-300" />
            Tip: take a screenshot so your code is always handy.
          </li>
        )}
      </motion.ul>
    </div>
  );
}
