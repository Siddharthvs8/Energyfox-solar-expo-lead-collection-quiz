import Link from "next/link";
import { PlayerShell } from "@/components/player-shell";

export default function NotFound() {
  return (
    <PlayerShell>
      <section className="my-auto animate-fade-up py-10 text-center">
        <p className="font-display text-7xl font-bold text-sun-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">This page is off the grid</h1>
        <p className="mx-auto mt-2 max-w-xs text-white/70">
          Scan the QR code at the Energyfox stall to take the Solar Quiz.
        </p>
        <Link href="/" className="btn-sun mx-auto mt-7 inline-flex h-12 items-center rounded-2xl px-6 font-semibold">
          Go to home
        </Link>
      </section>
    </PlayerShell>
  );
}
