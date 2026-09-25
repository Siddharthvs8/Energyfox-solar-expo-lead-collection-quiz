import { TriangleAlert } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { query, type Campaign } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";
import { CreateQrForm } from "./create-qr-form";
import { QrCard } from "./qr-card";

export const metadata = { title: "QR codes" };

export default async function QrPage() {
  const [siteUrl, campaigns] = await Promise.all([
    getSiteUrl(),
    query<Campaign & { leads: number }>(
      `SELECT c.*, count(l.id)::int AS leads
         FROM campaigns c LEFT JOIN leads l ON l.campaign_id = c.id
        GROUP BY c.id ORDER BY c.created_at DESC`,
    ),
  ]);
  const isLocal = /\/\/(localhost|127\.0\.0\.1)/.test(siteUrl);

  return (
    <>
      <PageHeader
        title="QR codes"
        description="One QR code works for unlimited visitors. Create one per stall or poster to compare how each performs."
      />

      {isLocal && (
        <p className="mb-5 flex gap-3 rounded-2xl border border-sun-200 bg-sun-50 p-4 text-sm text-sun-900">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-sun-600" />
          <span>
            These QR codes point to <strong>{siteUrl}</strong>, which phones can&apos;t open. Print them from your deployed
            Vercel site, or set <code className="font-mono">SITE_URL</code>.
          </span>
        </p>
      )}

      <CreateQrForm />

      {campaigns.length === 0 ? (
        <Card className="mt-6 px-5 py-16 text-center">
          <p className="font-semibold text-navy-900">No QR codes yet</p>
          <p className="mt-1 text-sm text-navy-400">Create your first one above. You can print it as a ready-made poster.</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => (
            <QrCard
              key={c.id}
              id={c.id}
              name={c.name}
              active={c.active}
              scans={c.scans}
              leads={c.leads}
              url={`${siteUrl}/play/${c.code}`}
              code={c.code}
            />
          ))}
        </div>
      )}
    </>
  );
}
