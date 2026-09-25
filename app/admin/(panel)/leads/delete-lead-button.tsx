"use client";

import { useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { buttonStyles } from "@/components/admin/ui";
import { deleteLead } from "../../actions";

export function DeleteLeadButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      title="Delete lead"
      aria-label={`Delete ${name}`}
      className={`${buttonStyles.ghost} hover:bg-rose-50 hover:text-rose-600`}
      onClick={() => {
        if (!confirm(`Delete ${name}? Their mobile number will be able to play again.`)) return;
        startTransition(() => deleteLead(id));
      }}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  );
}
