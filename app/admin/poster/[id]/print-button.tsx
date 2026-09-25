"use client";

import { Printer } from "lucide-react";
import { buttonStyles } from "@/components/admin/ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonStyles.accent}>
      <Printer className="size-4" />
      Print / Save as PDF
    </button>
  );
}
