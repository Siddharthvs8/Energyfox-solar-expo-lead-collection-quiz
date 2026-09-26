import Link from "next/link";
import { Logo } from "./logo";
import { SunBackdrop } from "./sun-backdrop";

/** Mobile-first frame for every player-facing screen. */
export function PlayerShell({
  children,
  headerRight,
}: {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <main className="relative isolate min-h-dvh overflow-x-clip text-white">
      <SunBackdrop />
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-[max(env(safe-area-inset-top),1.25rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <header className="flex items-center justify-between py-2">
          <Link href="/" aria-label="Energyfox home">
            <Logo tone="light" className="text-[1.35rem]" />
          </Link>
          {headerRight}
        </header>
        {children}
      </div>
    </main>
  );
}
