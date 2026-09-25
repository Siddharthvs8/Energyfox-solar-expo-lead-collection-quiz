/** The Energyfox sun mark, redrawn as SVG from the brand logo. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="#F99D1C"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="45.5" strokeWidth="9" />
      <path d="M50 24v25M19.5 46 33 59M80.5 46 67 59" strokeWidth="8" />
    </svg>
  );
}

/**
 * Full logo lockup. Size it with a text-size class (e.g. `text-2xl`);
 * the mark scales with the wordmark like in the original artwork.
 */
export function Logo({
  tone = "navy",
  className = "",
}: {
  tone?: "navy" | "light";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[0.45em] font-display font-semibold leading-none tracking-[-0.015em] ${
        tone === "light" ? "text-white" : "text-navy-800"
      } ${className}`}
    >
      <LogoMark className="h-[1.75em] w-[1.75em] shrink-0" />
      <span>Energyfox</span>
    </span>
  );
}
