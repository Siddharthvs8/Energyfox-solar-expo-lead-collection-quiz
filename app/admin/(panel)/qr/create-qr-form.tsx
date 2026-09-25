"use client";

import { useActionState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { buttonStyles, Card } from "@/components/admin/ui";
import { createCampaign, type CreateQrState } from "../../actions";

export function CreateQrForm() {
  const [state, formAction, pending] = useActionState<CreateQrState, FormData>(createCampaign, {});

  return (
    <Card className="p-4 sm:p-5">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="text-sm font-semibold text-navy-800">New QR code</span>
          <input
            name="name"
            required
            maxLength={80}
            placeholder="e.g. Main stall, Hall 3"
            className="mt-1.5 h-10 w-full rounded-xl border border-navy-200 px-3 text-sm outline-none placeholder:text-navy-300 focus:border-sun-500 focus:ring-4 focus:ring-sun-500/15"
          />
        </label>
        <button disabled={pending} className={buttonStyles.accent}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Create QR code
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}
    </Card>
  );
}
