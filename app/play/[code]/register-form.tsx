"use client";

import { useActionState } from "react";
import { ArrowRight, CircleAlert, LoaderCircle, Phone, User } from "lucide-react";
import { register, type RegisterState } from "@/app/actions";

export function RegisterForm({ code }: { code: string }) {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    register.bind(null, code),
    {},
  );

  return (
    <form action={formAction} className="glass space-y-4 rounded-3xl p-5" noValidate>
      <Field label="Your name" error={state.fieldErrors?.name} htmlFor="name">
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={60}
            defaultValue={state.values?.name}
            placeholder="e.g. Priya Sharma"
            aria-invalid={Boolean(state.fieldErrors?.name)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-navy-950/50 pr-4 pl-12 text-[1.05rem] text-white placeholder:text-white/30 transition outline-none focus:border-sun-400/70 focus:ring-4 focus:ring-sun-500/15 aria-invalid:border-rose-400/70"
          />
        </div>
      </Field>

      <Field label="Mobile number" error={state.fieldErrors?.phone} htmlFor="phone">
        <div className="flex h-14 overflow-hidden rounded-2xl border border-white/10 bg-navy-950/50 transition focus-within:border-sun-400/70 focus-within:ring-4 focus-within:ring-sun-500/15 has-aria-invalid:border-rose-400/70">
          <span className="flex items-center gap-1.5 border-r border-white/10 px-3.5 text-[1.05rem] font-semibold text-white/80">
            <Phone className="size-4 text-white/40" />
            +91
          </span>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            maxLength={16}
            defaultValue={state.values?.phone}
            placeholder="98765 43210"
            aria-invalid={Boolean(state.fieldErrors?.phone)}
            className="min-w-0 flex-1 bg-transparent px-4 text-[1.05rem] tracking-wide text-white placeholder:text-white/30 outline-none"
          />
        </div>
      </Field>

      {state.error && (
        <p
          role="alert"
          className="flex gap-2.5 rounded-2xl border border-sun-400/30 bg-sun-500/10 p-3.5 text-sm text-sun-100"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-sun-300" />
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="btn-sun group flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition active:scale-[0.98] disabled:opacity-80"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            Getting your wheel ready…
          </>
        ) : (
          <>
            Continue to spin
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-white/80">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
