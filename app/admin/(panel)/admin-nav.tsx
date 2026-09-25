"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, QrCode, Users } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/qr", label: "QR codes", icon: QrCode },
] as const;

export function AdminNav({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  if (orientation === "horizontal") {
    return (
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              isActive(href) ? "bg-white/12 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            <Icon className={`size-4 ${isActive(href) ? "text-sun-400" : ""}`} />
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="mt-8 space-y-1">
      {ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            isActive(href) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          {isActive(href) && <span className="absolute top-2 bottom-2 -left-4 w-1 rounded-r-full bg-sun-500" />}
          <Icon className={`size-[1.1rem] ${isActive(href) ? "text-sun-400" : ""}`} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
