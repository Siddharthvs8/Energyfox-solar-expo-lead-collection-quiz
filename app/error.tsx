"use client";

import { RotateCcw } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-navy-950 px-5 text-center text-white">
      <div>
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-xs text-white/70">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={reset}
          className="btn-sun mx-auto mt-7 inline-flex h-12 items-center gap-2 rounded-2xl px-6 font-semibold"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      </div>
    </main>
  );
}
