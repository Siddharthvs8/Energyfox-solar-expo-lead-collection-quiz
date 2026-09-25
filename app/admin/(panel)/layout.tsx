import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/admin-auth";
import { logout } from "../actions";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin · Energyfox", template: "%s · Energyfox admin" },
  robots: { index: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="min-h-dvh bg-navy-50 text-navy-800 lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-navy-900 px-4 py-6 text-white lg:flex">
        <Link href="/admin" className="px-3">
          <Logo tone="light" className="text-xl" />
        </Link>
        <p className="mt-3 px-3 text-[0.65rem] font-bold tracking-[0.25em] text-sun-300 uppercase">Expo admin</p>
        <AdminNav orientation="vertical" />
        <div className="mt-auto space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="size-[1.1rem]" />
            Open player site
          </Link>
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white">
              <LogOut className="size-[1.1rem]" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 bg-navy-900 text-white lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/admin">
              <Logo tone="light" className="text-lg" />
            </Link>
            <form action={logout}>
              <button aria-label="Sign out" className="grid size-9 place-items-center rounded-lg text-white/70 hover:text-white">
                <LogOut className="size-5" />
              </button>
            </form>
          </div>
          <AdminNav orientation="horizontal" />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
