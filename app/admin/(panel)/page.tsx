import Link from "next/link";
import { ArrowRight, Download, QrCode } from "lucide-react";
import { buttonStyles, Card, CardHeader, DiscountBadge, PageHeader, StatTile } from "@/components/admin/ui";
import { query, type Lead } from "@/lib/db";
import { formatNumber, timeAgo, TIME_ZONE } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { SOLAR_DISCOUNTS } from "@/lib/prizes";

export const metadata = { title: "Dashboard" };

type Stats = { leads: number; completed: number; today: number; avg_discount: number | null };
type CampaignPerf = { id: number; name: string; active: boolean; scans: number; leads: number };

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export default async function DashboardPage() {
  const [[stats], distribution, campaigns, recent] = await Promise.all([
    query<Stats>(
      `SELECT count(*)::int AS leads,
              count(*) FILTER (WHERE status = 'completed')::int AS completed,
              count(*) FILTER (WHERE created_at >= date_trunc('day', now() AT TIME ZONE $1) AT TIME ZONE $1)::int AS today,
              round(avg(discount) FILTER (WHERE status = 'completed'), 1)::float AS avg_discount
         FROM leads`,
      [TIME_ZONE],
    ),
    query<{ discount: number; count: number }>(
      "SELECT discount, count(*)::int AS count FROM leads WHERE status = 'completed' GROUP BY discount",
    ),
    query<CampaignPerf>(
      `SELECT c.id, c.name, c.active, c.scans, count(l.id)::int AS leads
         FROM campaigns c LEFT JOIN leads l ON l.campaign_id = c.id
        GROUP BY c.id ORDER BY c.created_at DESC`,
    ),
    query<Pick<Lead, "id" | "name" | "phone" | "status" | "discount" | "created_at">>(
      "SELECT id, name, phone, status, discount, created_at FROM leads ORDER BY created_at DESC LIMIT 6",
    ),
  ]);

  const scans = campaigns.reduce((sum, c) => sum + c.scans, 0);
  const counts = new Map(distribution.map((d) => [d.discount, d.count]));
  const bars = SOLAR_DISCOUNTS.map((d) => ({ label: `${d}% off`, hint: "Solar project", value: counts.get(d) ?? 0 }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live results from the Energyfox Spin & Win."
        actions={
          <>
            <a href="/admin/leads/export" className={buttonStyles.secondary}>
              <Download className="size-4" />
              Export CSV
            </a>
            <Link href="/admin/qr" className={buttonStyles.primary}>
              <QrCode className="size-4" />
              QR codes
            </Link>
          </>
        }
      />

      {campaigns.length === 0 && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 border-sun-200 bg-sun-50 px-5 py-4">
          <div>
            <p className="font-semibold text-navy-900">Start by creating your contest QR code</p>
            <p className="mt-0.5 text-sm text-navy-500">Print it at your stall. One QR code works for unlimited visitors.</p>
          </div>
          <Link href="/admin/qr" className={buttonStyles.accent}>
            Create QR code <ArrowRight className="size-4" />
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Leads collected" value={formatNumber(stats.leads)} detail={`+${formatNumber(stats.today)} today`} />
        <StatTile label="QR scans" value={formatNumber(scans)} detail={`${pct(stats.leads, scans)}% registered`} />
        <StatTile
          label="Wheels spun"
          value={formatNumber(stats.completed)}
          detail={`${pct(stats.completed, stats.leads)}% of leads spun`}
        />
        <StatTile
          label="Average discount"
          value={stats.avg_discount === null ? "–" : `${stats.avg_discount}%`}
          detail={stats.avg_discount === null ? "No spins yet" : "Across all spins"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-5 lg:gap-6">
        <Card className="lg:col-span-3">
          <CardHeader title="Discounts won" description="Spins by prize" />
          <DiscountBars bars={bars} total={stats.completed} />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Latest leads"
            action={
              <Link href="/admin/leads" className="text-sm font-semibold text-sun-700 hover:text-sun-800">
                View all
              </Link>
            }
          />
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-navy-400">Leads will appear here as visitors play.</p>
          ) : (
            <ul className="divide-y divide-navy-100">
              {recent.map((lead) => (
                <li key={lead.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-100 text-sm font-bold text-navy-600">
                    {lead.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-900">{lead.name}</p>
                    <p className="text-xs text-navy-400">
                      {formatPhone(lead.phone)} · {timeAgo(lead.created_at)}
                    </p>
                  </div>
                  <DiscountBadge discount={lead.discount} status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {campaigns.length > 0 && (
        <Card className="mt-4 overflow-hidden lg:mt-6">
          <CardHeader title="QR code performance" description="Scans are counted each time the QR page is opened" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-navy-400">
                  <th className="px-5 py-3 font-semibold">QR code</th>
                  <th className="px-5 py-3 text-right font-semibold">Scans</th>
                  <th className="px-5 py-3 text-right font-semibold">Leads</th>
                  <th className="px-5 py-3 text-right font-semibold">Scan → lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 tabular-nums">
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-navy-900">{c.name}</span>
                      {!c.active && (
                        <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-500">Paused</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">{formatNumber(c.scans)}</td>
                    <td className="px-5 py-3 text-right">{formatNumber(c.leads)}</td>
                    <td className="px-5 py-3 text-right">{pct(c.leads, c.scans)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

/** Horizontal bar chart: one series, so one hue and no legend; values sit at the bar tips. */
function DiscountBars({ bars, total }: { bars: { label: string; hint: string; value: number }[]; total: number }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="space-y-4 px-5 py-5">
      {bars.map((bar) => {
        const share = pct(bar.value, total);
        return (
          <div key={bar.label} className="group relative grid grid-cols-[6.5rem_1fr] items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-navy-800">{bar.label}</p>
              <p className="text-xs text-navy-400">{bar.hint}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="h-5 rounded-r-[4px] bg-sun-500 transition-[width] duration-700 group-hover:bg-sun-600"
                style={{ width: `calc((100% - 3.5rem) * ${bar.value / max})`, minWidth: bar.value > 0 ? 4 : 0 }}
              />
              <span className="text-sm font-semibold text-navy-800 tabular-nums">{formatNumber(bar.value)}</span>
            </div>
            <span
              role="tooltip"
              className="pointer-events-none absolute -top-9 left-28 z-10 rounded-lg bg-navy-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition group-hover:opacity-100"
            >
              {bar.label}: {formatNumber(bar.value)} {bar.value === 1 ? "person" : "people"} · {share}% of spins
            </span>
          </div>
        );
      })}
      {total === 0 && <p className="text-center text-xs text-navy-400">No spins yet.</p>}
    </div>
  );
}
