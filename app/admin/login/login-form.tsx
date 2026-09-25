"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div className="relative">
        <Lock className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
        <input
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus
          placeholder="Admin password"
          aria-label="Admin password"
          className="h-13 w-full rounded-2xl border border-white/10 bg-navy-950/50 pr-12 pl-12 text-white placeholder:text-white/30 outline-none focus:border-sun-400/70 focus:ring-4 focus:ring-sun-500/15"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-white/50 hover:text-white"
        >
          {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-rose-300">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="btn-sun flex h-13 w-full items-center justify-center gap-2 rounded-2xl font-semibold transition disabled:opacity-80"
      >
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        Sign in
      </button>
    </form>
  );
}
