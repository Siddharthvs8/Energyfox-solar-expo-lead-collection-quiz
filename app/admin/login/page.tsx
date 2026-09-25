import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SunBackdrop } from "@/components/sun-backdrop";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in · Energyfox", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="relative isolate grid min-h-dvh place-items-center px-5 py-10 text-white">
      <SunBackdrop />
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center">
          <Logo tone="light" className="text-3xl" />
          <p className="mt-4 text-sm font-semibold tracking-[0.2em] text-sun-300 uppercase">Expo admin</p>
        </div>
        <div className="glass mt-8 rounded-3xl p-6">
          <h1 className="font-display text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-white/60">Manage QR codes and see your expo leads.</p>
          {isAdminConfigured() ? (
            <LoginForm />
          ) : (
            <p className="mt-5 rounded-2xl border border-sun-400/30 bg-sun-500/10 p-4 text-sm text-sun-100">
              Set an <code className="font-mono text-sun-300">ADMIN_PASSWORD</code> environment variable
              to enable the admin panel, then redeploy.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
