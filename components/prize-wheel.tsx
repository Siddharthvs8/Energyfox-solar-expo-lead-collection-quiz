"use client";

import { useId } from "react";
import { motion, type MotionValue } from "motion/react";
import { PRIZES, WHEEL, type PrizeId } from "@/lib/prizes";
import { LogoMark } from "./logo";

/** FoxGrid unit cut out of the product photo (transparent PNG, square). */
export const INVERTER_IMAGE = "/foxgrid-inverter.png";
export const SLICE_ANGLE = 360 / WHEEL.length;

export type WheelState = "idle" | "spinning" | "won";

const C = 200; // centre of the 400×400 viewBox
const R = 181; // slice radius
const BULBS = 24;

function point(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
}

// One slice pointing straight up; each slice is this shape rotated into place.
const WEDGE = `M${C} ${C} L${point(R, -SLICE_ANGLE / 2)} A${R} ${R} 0 0 1 ${point(R, SLICE_ANGLE / 2)} Z`;

type Ids = Record<"cream" | "sun" | "navy" | "silver" | "gold" | "rim" | "shadow" | "spot" | "bulb" | "ptr", string>;

const THEME: Record<PrizeId, { fill: keyof Ids; ink: string; sub: string }> = {
  solar5: { fill: "cream", ink: "#192649", sub: "#bb630c" },
  solar10: { fill: "sun", ink: "#111a36", sub: "#111a36" },
  solar15: { fill: "navy", ink: "gold", sub: "#fed993" },
  inverter50: { fill: "silver", ink: "#192649", sub: "#e3820b" },
};

/**
 * The Energyfox prize wheel. Only the slices rotate (as one GPU layer); the
 * rim, lights, sheen, hub and pointer stay put, like a real wheel.
 * Without `rotate` it turns slowly on its own (for decorative use).
 */
export function PrizeWheel({
  rotate,
  pointer,
  state = "idle",
  winner = null,
  onSpin,
  className = "",
}: {
  rotate?: MotionValue<number>;
  pointer?: MotionValue<number>;
  state?: WheelState;
  winner?: number | null;
  onSpin?: () => void;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = Object.fromEntries(
    ["cream", "sun", "navy", "silver", "gold", "rim", "shadow", "spot", "bulb", "ptr"].map((k) => [k, `${uid}-${k}`]),
  ) as Ids;
  const url = (key: keyof Ids) => `url(#${ids[key]})`;
  const paint = (value: string) => (value in ids ? url(value as keyof Ids) : value);
  const won = state === "won" && winner !== null;

  const Hub = onSpin ? "button" : "div";

  return (
    <div data-state={state} className={`@container relative aspect-square ${className}`}>
      {/* Warm glow behind the wheel */}
      <div
        aria-hidden="true"
        className={`absolute -inset-[9%] rounded-full blur-3xl transition-opacity duration-700 ${
          won ? "animate-pulse-glow opacity-100" : "opacity-70"
        }`}
        style={{ background: "radial-gradient(circle, rgb(249 157 28 / 0.55) 0%, rgb(249 157 28 / 0.12) 55%, transparent 72%)" }}
      />

      {/* Rim with chasing lights (static) */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full drop-shadow-[0_22px_40px_rgb(0_0_0/0.55)]" aria-hidden="true">
        <defs>
          <linearGradient id={ids.rim} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0c7" />
            <stop offset="0.28" stopColor="#f9a826" />
            <stop offset="0.5" stopColor="#a4570b" />
            <stop offset="0.72" stopColor="#ffd98a" />
            <stop offset="1" stopColor="#d9760a" />
          </linearGradient>
          <radialGradient id={ids.bulb}>
            <stop offset="0" stopColor="#fffbe8" />
            <stop offset="0.45" stopColor="#ffe08a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffb23e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={199} fill={url("rim")} />
        <circle cx={C} cy={C} r={198} fill="none" stroke="#fff6dc" strokeOpacity={0.6} strokeWidth={1} />
        <circle cx={C} cy={C} r={185} fill="#070c1f" />
        <g>
          {Array.from({ length: BULBS }, (_, i) => {
            const a = (i * 360) / BULBS;
            const [x, y] = point(191.5, a).split(" ");
            return (
              <g key={i} className="wheel-bulb">
                <circle cx={x} cy={y} r={7} fill={url("bulb")} />
                <circle cx={x} cy={y} r={3.2} fill="#fffaf0" />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Slices (the only rotating layer) */}
      <motion.div
        className={`absolute inset-0 will-change-transform ${rotate ? "" : "animate-spin-slow"}`}
        style={rotate ? { rotate } : { animationDuration: "48s" }}
      >
        <svg viewBox="0 0 400 400" className="size-full" role="img" aria-label="Prize wheel">
          <defs>
            <radialGradient id={ids.cream} cx={C} cy={C} r={R} gradientUnits="userSpaceOnUse">
              <stop offset="0.25" stopColor="#fde2ae" />
              <stop offset="1" stopColor="#fffaf0" />
            </radialGradient>
            <radialGradient id={ids.sun} cx={C} cy={C} r={R} gradientUnits="userSpaceOnUse">
              <stop offset="0.25" stopColor="#ea7f06" />
              <stop offset="1" stopColor="#ffc65c" />
            </radialGradient>
            <radialGradient id={ids.navy} cx={C} cy={C} r={R} gradientUnits="userSpaceOnUse">
              <stop offset="0.25" stopColor="#0b1128" />
              <stop offset="1" stopColor="#2b3b75" />
            </radialGradient>
            <radialGradient id={ids.silver} cx={C} cy={C} r={R} gradientUnits="userSpaceOnUse">
              <stop offset="0.25" stopColor="#cfd7e6" />
              <stop offset="1" stopColor="#ffffff" />
            </radialGradient>
            <linearGradient id={ids.gold} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe7a8" />
              <stop offset="0.5" stopColor="#fbb03a" />
              <stop offset="1" stopColor="#ffd98a" />
            </linearGradient>
            <radialGradient id={ids.spot} cx="50%" cy="38%" r="65%">
              <stop offset="0" stopColor="#3a4f96" />
              <stop offset="0.6" stopColor="#1a2754" />
              <stop offset="1" stopColor="#0b1128" />
            </radialGradient>
            <filter id={ids.shadow} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0b1230" floodOpacity="0.35" />
            </filter>
          </defs>

          {WHEEL.map((id, i) => (
            <g key={i} transform={`rotate(${i * SLICE_ANGLE} ${C} ${C})`}>
              <path d={WEDGE} fill={url(THEME[id].fill)} />
              <SliceLabel id={id} ink={paint(THEME[id].ink)} sub={THEME[id].sub} ids={ids} gold={url("gold")} />
              {won && i !== winner && <path d={WEDGE} fill="#070c1f" className="wheel-dim" />}
              {won && i === winner && (
                <path d={WEDGE} fill="#ffffff" stroke="#ffe08a" strokeWidth={4} strokeLinejoin="round" className="wheel-win" />
              )}
            </g>
          ))}

          {/* Dividers and pegs */}
          {WHEEL.map((_, i) => {
            const a = i * SLICE_ANGLE + SLICE_ANGLE / 2;
            const [x, y] = point(R - 7, a).split(" ");
            return (
              <g key={i}>
                <path d={`M${point(47, a)} L${point(R, a)}`} stroke="#ffe7b0" strokeOpacity={0.85} strokeWidth={1.6} />
                <circle cx={x} cy={y} r={4} fill="#fffaf0" stroke="#b9640b" strokeWidth={1.4} />
              </g>
            );
          })}
          <circle cx={C} cy={C} r={R - 0.5} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={3} />
        </svg>
      </motion.div>

      {/* Glassy sheen (static, so the light doesn't spin with the wheel) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[5%] rounded-full"
        style={{
          background:
            "radial-gradient(120% 90% at 28% 18%, rgb(255 255 255 / 0.2) 0%, rgb(255 255 255 / 0.05) 35%, transparent 55%), radial-gradient(circle, transparent 62%, rgb(0 0 0 / 0.28) 100%)",
        }}
      />

      {/* Hub */}
      <Hub
        {...(onSpin
          ? { type: "button" as const, onClick: onSpin, disabled: state !== "idle", "aria-label": "Spin the wheel" }
          : { "aria-hidden": true })}
        className={`group absolute top-1/2 left-1/2 grid size-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-[0_10px_28px_rgb(0_0_0/0.5),inset_0_2px_3px_rgb(255_255_255/0.6)] transition-transform duration-300 ${
          onSpin && state === "idle" ? "cursor-pointer hover:scale-105 active:scale-95" : ""
        }`}
        style={{ background: "conic-gradient(from 210deg, #fff0c7, #f9a826, #a4570b, #ffd98a, #d9760a, #fff0c7)" }}
      >
        <span className="grid size-[84%] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_28%,#ffffff_0%,#f1f4fa_55%,#d3dae8_100%)] shadow-[inset_0_-3px_6px_rgb(25_38_73/0.18)]">
          <span className="flex flex-col items-center">
            <LogoMark className={onSpin ? "w-[9cqw]" : "w-[11cqw]"} />
            {onSpin && (
              <span className="mt-[0.9cqw] font-display text-[2.6cqw] leading-none font-extrabold tracking-[0.18em] text-navy-800">
                SPIN
              </span>
            )}
          </span>
        </span>
      </Hub>

      {/* Pointer */}
      <motion.div
        aria-hidden="true"
        className="absolute top-0 left-1/2 z-10 w-[12.5%] -translate-x-1/2 -translate-y-[42%] drop-shadow-[0_6px_6px_rgb(0_0_0/0.45)]"
        style={{ rotate: pointer, transformOrigin: "50% 36%" }}
      >
        <svg viewBox="0 0 60 84">
          <defs>
            <linearGradient id={ids.ptr} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2f418a" />
              <stop offset="1" stopColor="#0a1026" />
            </linearGradient>
          </defs>
          <path
            d="M30 82 C25 68 5 50 5 30 A25 25 0 1 1 55 30 C55 50 35 68 30 82 Z"
            fill={url("ptr")}
            stroke={url("rim")}
            strokeWidth={3.5}
          />
          <circle cx={30} cy={30} r={11} fill={url("rim")} />
          <circle cx={26.5} cy={26.5} r={3.5} fill="#fff" fillOpacity={0.8} />
        </svg>
      </motion.div>
    </div>
  );
}

function SliceLabel({ id, ink, sub, ids, gold }: { id: PrizeId; ink: string; sub: string; ids: Ids; gold: string }) {
  const y = (r: number) => C - r;
  const prize = PRIZES[id];

  if (id === "inverter50") {
    return (
      <g>
        {/* Dark spotlight badge so the white unit stands out; the unit pops slightly out of it. */}
        <circle cx={C} cy={y(132)} r={30} fill={`url(#${ids.spot})`} stroke={gold} strokeWidth={3.5} />
        <image
          href={INVERTER_IMAGE}
          x={C - 31}
          y={y(132) - 32}
          width={62}
          height={62}
          preserveAspectRatio="xMidYMid meet"
          filter={`url(#${ids.shadow})`}
        />
        <text x={C} y={y(86)} textAnchor="middle" className="font-display" fontSize={16} fontWeight={800} fill={ink}>
          {prize.discount}% OFF
        </text>
        <text x={C} y={y(74)} textAnchor="middle" fontSize={8.5} fontWeight={800} letterSpacing={1.2} fill={sub}>
          FOXGRID
        </text>
        <text x={C} y={y(64)} textAnchor="middle" fontSize={8} fontWeight={700} letterSpacing={0.8} fill="#4e5d8c">
          INVERTER
        </text>
      </g>
    );
  }

  return (
    <g>
      <text x={C + 2} y={y(120)} textAnchor="middle" className="font-display" fontSize={40} fontWeight={800} letterSpacing={-1.5} fill={ink}>
        {prize.discount}
        <tspan fontSize={20} dy={-15}>
          %
        </tspan>
      </text>
      <text x={C} y={y(99)} textAnchor="middle" className="font-display" fontSize={13} fontWeight={800} letterSpacing={3.5} fill={ink}>
        OFF
      </text>
      <text x={C} y={y(84)} textAnchor="middle" fontSize={8.5} fontWeight={700} letterSpacing={1.4} fill={sub}>
        SOLAR
      </text>
      <text x={C} y={y(74)} textAnchor="middle" fontSize={8.5} fontWeight={700} letterSpacing={1.4} fill={sub}>
        PROJECT
      </text>
    </g>
  );
}
