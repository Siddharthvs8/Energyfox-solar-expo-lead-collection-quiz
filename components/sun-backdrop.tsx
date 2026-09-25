// Fixed positions (not Math.random) so server and client render the same markup.
const EMBERS = [
  { left: 6, size: 3, delay: 0, duration: 13 },
  { left: 14, size: 2, delay: 5, duration: 16 },
  { left: 22, size: 4, delay: 2.5, duration: 12 },
  { left: 31, size: 2, delay: 8, duration: 15 },
  { left: 39, size: 3, delay: 1, duration: 17 },
  { left: 47, size: 2, delay: 6.5, duration: 13 },
  { left: 55, size: 4, delay: 3.5, duration: 14 },
  { left: 63, size: 2, delay: 9, duration: 16 },
  { left: 71, size: 3, delay: 0.5, duration: 12 },
  { left: 79, size: 2, delay: 7, duration: 15 },
  { left: 87, size: 4, delay: 4, duration: 13 },
  { left: 94, size: 2, delay: 10, duration: 17 },
];

/** Animated "sunrise" background for the player-facing screens. */
export function SunBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-navy-950">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% -5%, #2a3a72 0%, #172350 35%, #0d1532 65%, #090f24 100%)",
        }}
      />
      {/* Slowly turning sun rays */}
      <div
        className="absolute left-1/2 top-[-55vmax] h-[110vmax] w-[110vmax] -translate-x-1/2 animate-spin-slow opacity-25"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, rgb(249 157 28 / 0.55) 0deg 3deg, transparent 3deg 15deg)",
          maskImage: "radial-gradient(circle, black 0%, rgb(0 0 0 / 0.6) 30%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle, black 0%, rgb(0 0 0 / 0.6) 30%, transparent 62%)",
        }}
      />
      {/* The sun itself */}
      <div
        className="absolute left-1/2 top-[-22vmax] h-[48vmax] w-[48vmax] -translate-x-1/2 animate-pulse-glow rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgb(255 205 110 / 0.7) 0%, rgb(249 157 28 / 0.35) 38%, transparent 70%)",
        }}
      />
      {/* Rising embers */}
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-[-20px] animate-rise rounded-full bg-sun-300"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
            boxShadow: "0 0 8px 2px rgb(249 157 28 / 0.6)",
          }}
        />
      ))}
      {/* Horizon glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(to top, rgb(249 157 28 / 0.08), transparent)" }}
      />
    </div>
  );
}
