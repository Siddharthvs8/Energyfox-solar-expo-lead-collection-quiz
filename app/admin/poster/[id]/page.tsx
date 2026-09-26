import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Camera } from "lucide-react";
import { BrandedQr } from "@/components/branded-qr";
import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/admin-auth";
import { query, type Campaign } from "@/lib/db";
import { MAX_SOLAR_DISCOUNT, SOLAR_DISCOUNTS } from "@/lib/prizes";
import { getSiteUrl } from "@/lib/site-url";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "QR poster · Energyfox", robots: { index: false } };

export default async function PosterPage({ params }: PageProps<"/admin/poster/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [[campaign], siteUrl] = await Promise.all([
    query<Campaign>("SELECT * FROM campaigns WHERE id = $1", [id]),
    getSiteUrl(),
  ]);
  if (!campaign) notFound();
  const url = `${siteUrl}/play/${campaign.code}`;

  return (
    <main className="min-h-dvh bg-navy-100 py-8 print:bg-white print:p-0">
      {/* A4 page, no margins, keep backgrounds when printing. */}
      <style>{`@page { size: A4; margin: 0 } html, body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }`}</style>

      <div className="no-print mx-auto mb-6 flex w-[210mm] max-w-full items-center justify-between px-4">
        <div>
          <p className="font-semibold text-navy-900">{campaign.name}</p>
          <p className="text-sm text-navy-500">A4 poster. Print at 100% scale.</p>
        </div>
        <PrintButton />
      </div>

      <article className="relative mx-auto flex h-[297mm] w-[210mm] flex-col items-center overflow-hidden bg-navy-950 px-[16mm] pt-[16mm] pb-[12mm] text-center text-white shadow-2xl print:shadow-none">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "radial-gradient(110% 60% at 50% -5%, #2a3a72 0%, #172350 40%, #090f24 100%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute top-[-120mm] left-1/2 h-[300mm] w-[300mm] -translate-x-1/2"
          style={{
            background: "repeating-conic-gradient(from 0deg, rgb(249 157 28 / 0.22) 0deg 3deg, transparent 3deg 15deg)",
            maskImage: "radial-gradient(circle, black 0%, transparent 60%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-[-70mm] left-1/2 h-[150mm] w-[150mm] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgb(255 205 110 / 0.55) 0%, rgb(249 157 28 / 0.2) 40%, transparent 70%)" }}
        />

        <div className="relative flex flex-1 flex-col items-center">
          <Logo tone="light" className="text-[13mm]" />
          <p className="mt-[9mm] text-[4.2mm] font-bold tracking-[0.35em] text-sun-300 uppercase">Spin &amp; Win</p>
          <h1 className="mt-[3mm] font-display text-[15mm] leading-[1.05] font-bold tracking-tight">
            Scan, spin &amp; win up to
            <br />
            <span className="text-sun-400">{MAX_SOLAR_DISCOUNT}% OFF</span>
          </h1>
          <p className="mt-[4mm] text-[5.2mm] text-white/75">
            Every spin wins a discount on your solar project
          </p>

          <div className="mt-[8mm] rounded-[7mm] bg-white p-[3mm] shadow-[0_0_60px_rgb(249_157_28/0.45)]">
            <BrandedQr url={url} label={`QR code linking to ${url}`} className="block w-[100mm] rounded-[5mm]" />
          </div>
          <p className="mt-[5mm] flex items-center gap-[2.5mm] text-[4.6mm] font-semibold text-sun-200">
            <Camera className="size-[5.5mm]" />
            Point your phone camera here
          </p>

          <ul className="mt-auto grid w-full grid-cols-3 gap-[4mm]">
            {SOLAR_DISCOUNTS.map((discount, i) => (
              <li
                key={discount}
                className={`rounded-[5mm] border px-[3mm] py-[4mm] ${
                  i === 0 ? "border-sun-400/70 bg-sun-500/20" : "border-white/15 bg-white/[0.06]"
                }`}
              >
                <p className={`font-display text-[11mm] leading-none font-bold ${i === 0 ? "text-sun-400" : ""}`}>
                  {discount}%
                </p>
                <p className="mt-[1.5mm] text-[3.2mm] font-bold tracking-[0.25em] text-sun-300 uppercase">off</p>
                <p className="mt-[1mm] text-[3mm] font-semibold tracking-wide text-white/60 uppercase">Solar project</p>
              </li>
            ))}
          </ul>
        </div>

        <footer className="relative mt-[7mm] flex w-full items-center justify-between border-t border-white/15 pt-[4mm] text-[3.4mm] text-white/55">
          <span>One spin per mobile number</span>
          <span className="font-mono">{url.replace(/^https?:\/\//, "")}</span>
        </footer>
      </article>
    </main>
  );
}
