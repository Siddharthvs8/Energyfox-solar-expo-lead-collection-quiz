import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, MessageCircle, Phone, Search } from "lucide-react";
import { buttonStyles, Card, DiscountBadge, PageHeader } from "@/components/admin/ui";
import { query, type Lead } from "@/lib/db";
import { formatDateTime, formatNumber } from "@/lib/format";
import { filtersToQuery, leadWhere, readLeadFilters, REWARD_FILTERS } from "@/lib/lead-filters";
import { formatPhone } from "@/lib/phone";
import { DeleteLeadButton } from "./delete-lead-button";

export const metadata = { title: "Leads" };

const PAGE_SIZE = 25;

type LeadRow = Omit<Lead, "token"> & { campaign_name: string | null };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const params = await searchParams;
  const filters = readLeadFilters(params);
  const page = Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1);
  const { where, params: sqlParams } = leadWhere(filters);

  const [[{ total }], leads] = await Promise.all([
    query<{ total: number }>(`SELECT count(*)::int AS total FROM leads l ${where}`, sqlParams),
    query<LeadRow>(
      `SELECT l.id, l.name, l.phone, l.phone_key, l.campaign_id, l.prize, l.discount, l.status, l.coupon,
              l.created_at, l.completed_at, c.name AS campaign_name
         FROM leads l LEFT JOIN campaigns c ON c.id = l.campaign_id
         ${where}
        ORDER BY l.created_at DESC
        LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      sqlParams,
    ),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);
  const filtered = Boolean(filters.q || filters.reward);

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${formatNumber(total)} ${filtered ? "matching" : "people registered"}`}
        actions={
          <a href={`/admin/leads/export${filtersToQuery(filters)}`} className={buttonStyles.primary}>
            <Download className="size-4" />
            Export CSV
          </a>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-navy-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <form className="relative w-full lg:max-w-xs" role="search">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-400" />
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search name, mobile or coupon"
              aria-label="Search leads"
              className="h-10 w-full rounded-xl border border-navy-200 bg-white pr-3 pl-9 text-sm outline-none placeholder:text-navy-300 focus:border-sun-500 focus:ring-4 focus:ring-sun-500/15"
            />
            {filters.reward && <input type="hidden" name="reward" value={filters.reward} />}
          </form>
          <div className="flex gap-1.5 overflow-x-auto">
            {REWARD_FILTERS.map((f) => {
              const active = filters.reward === f.value;
              return (
                <Link
                  key={f.value}
                  href={`/admin/leads${filtersToQuery({ q: filters.q, reward: f.value })}`}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active ? "bg-navy-800 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {leads.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-navy-400">
            {filtered ? "No leads match these filters." : "No leads yet. They'll appear here as visitors play."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-navy-50/60">
                <tr className="text-left text-xs text-navy-400">
                  <th className="px-5 py-3 font-semibold">Lead</th>
                  <th className="px-3 py-3 font-semibold">Reward</th>
                  <th className="px-3 py-3 font-semibold">Coupon</th>
                  <th className="px-3 py-3 font-semibold">QR code</th>
                  <th className="px-3 py-3 font-semibold">Registered</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-navy-50/50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-navy-900">{lead.name}</p>
                      <p className="text-xs text-navy-500 tabular-nums">{formatPhone(lead.phone)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <DiscountBadge discount={lead.discount} status={lead.status} />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-navy-700">{lead.coupon ?? "–"}</td>
                    <td className="max-w-40 truncate px-3 py-3 text-navy-600">{lead.campaign_name ?? "–"}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-navy-600">{formatDateTime(lead.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <a href={`tel:${lead.phone}`} className={buttonStyles.ghost} aria-label={`Call ${lead.name}`} title="Call">
                          <Phone className="size-4" />
                        </a>
                        <a
                          href={whatsappLink(lead)}
                          target="_blank"
                          rel="noreferrer"
                          className={`${buttonStyles.ghost} hover:text-emerald-600`}
                          aria-label={`WhatsApp ${lead.name}`}
                          title="WhatsApp"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                        <DeleteLeadButton id={lead.id} name={lead.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t border-navy-100 px-5 py-3 text-sm text-navy-500">
            <p className="tabular-nums">
              {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
            </p>
            <div className="flex gap-1">
              <PageLink href={`/admin/leads${filtersToQuery({ ...filters, page: page - 1 })}`} disabled={page <= 1} label="Previous page">
                <ChevronLeft className="size-4" />
              </PageLink>
              <PageLink href={`/admin/leads${filtersToQuery({ ...filters, page: page + 1 })}`} disabled={page >= pages} label="Next page">
                <ChevronRight className="size-4" />
              </PageLink>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span aria-disabled="true" className="grid size-9 place-items-center rounded-lg text-navy-200">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className="grid size-9 place-items-center rounded-lg text-navy-600 hover:bg-navy-50">
      {children}
    </Link>
  );
}

function whatsappLink(lead: Pick<LeadRow, "name" | "phone" | "discount" | "coupon" | "status">) {
  const firstName = lead.name.split(" ")[0];
  const reward =
    lead.status === "completed" && lead.discount > 0
      ? ` You won ${lead.discount}% off your solar project${lead.coupon ? ` (code ${lead.coupon})` : ""}.`
      : "";
  const text = `Hi ${firstName}, thanks for visiting Energyfox at the Solar Expo!${reward} When would be a good time to talk about solar for your home?`;
  return `https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
