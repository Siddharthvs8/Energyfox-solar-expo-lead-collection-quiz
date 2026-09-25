"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Download, LoaderCircle, Pause, Play, Printer, Trash2 } from "lucide-react";
import { BrandedQr, brandedQrPng } from "@/components/branded-qr";
import { buttonStyles, Card } from "@/components/admin/ui";
import { deleteCampaign, toggleCampaign } from "../../actions";

export function QrCard({
  id,
  name,
  active,
  scans,
  leads,
  url,
  code,
}: {
  id: number;
  name: string;
  active: boolean;
  scans: number;
  leads: number;
  url: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const link = document.createElement("a");
    link.href = brandedQrPng(url);
    link.download = `energyfox-qr-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || code}.png`;
    link.click();
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative bg-linear-to-br from-navy-800 to-navy-950 p-6">
        <BrandedQr url={url} label={`QR code for ${name}`} className={`mx-auto w-full max-w-56 rounded-2xl shadow-xl ${active ? "" : "opacity-40 grayscale"}`} />
        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold ${
            active ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/70"
          }`}
        >
          {active ? "● Live" : "Paused"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-semibold text-navy-900">{name}</h2>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-navy-50 py-1.5 pr-1.5 pl-3">
          <a href={url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-xs text-navy-600 hover:text-navy-900">
            {url.replace(/^https?:\/\//, "")}
          </a>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy link"
            className="grid size-7 shrink-0 place-items-center rounded-md text-navy-500 hover:bg-white hover:text-navy-900"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-navy-100 rounded-xl border border-navy-100 text-center tabular-nums">
          <Stat label="Scans" value={scans} />
          <Stat label="Leads" value={leads} />
          <Stat label="Converted" value={`${scans ? Math.round((leads / scans) * 100) : 0}%`} />
        </dl>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={download} className={buttonStyles.accent}>
            <Download className="size-4" />
            PNG
          </button>
          <Link href={`/admin/poster/${id}`} target="_blank" className={buttonStyles.secondary}>
            <Printer className="size-4" />
            Poster
          </Link>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleCampaign(id))}
            className={buttonStyles.ghost}
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : active ? <Pause className="size-4" /> : <Play className="size-4" />}
            {active ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete “${name}”? Printed copies will stop working. Leads already collected are kept.`)) return;
              startTransition(() => deleteCampaign(id));
            }}
            className={`${buttonStyles.ghost} hover:bg-rose-50 hover:text-rose-600`}
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col-reverse px-2 py-2.5">
      <dt className="text-[0.7rem] font-semibold text-navy-400">{label}</dt>
      <dd className="font-display text-lg font-semibold text-navy-900">{value}</dd>
    </div>
  );
}
