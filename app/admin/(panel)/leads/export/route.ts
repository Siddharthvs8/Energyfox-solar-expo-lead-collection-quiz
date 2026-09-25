import { isAdmin } from "@/lib/admin-auth";
import { query, type Lead } from "@/lib/db";
import { formatFullDateTime, TIME_ZONE } from "@/lib/format";
import { leadWhere, readLeadFilters } from "@/lib/lead-filters";
import { formatPhone } from "@/lib/phone";

type ExportRow = Pick<Lead, "name" | "phone" | "score" | "discount" | "status" | "coupon" | "created_at" | "completed_at"> & {
  campaign_name: string | null;
};

// Quote every cell, and defuse values Excel would run as formulas (=, +, -, @).
function cell(value: string | number | null) {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const filters = readLeadFilters(Object.fromEntries(new URL(request.url).searchParams));
  const { where, params } = leadWhere(filters);
  const rows = await query<ExportRow>(
    `SELECT l.name, l.phone, l.score, l.discount, l.status, l.coupon, l.created_at, l.completed_at,
            c.name AS campaign_name
       FROM leads l LEFT JOIN campaigns c ON c.id = l.campaign_id
       ${where}
      ORDER BY l.created_at DESC`,
    params,
  );

  const header = [
    "Name",
    "Mobile",
    "Score",
    "Discount (%)",
    "Status",
    "Coupon",
    "QR code",
    `Registered (${TIME_ZONE})`,
    `Completed (${TIME_ZONE})`,
  ];
  const lines = rows.map((r) =>
    [
      r.name,
      // Spaces keep Excel from turning the number into 9.19877E+11.
      formatPhone(r.phone).replace(/^\+/, ""),
      r.status === "completed" ? r.score : null,
      r.status === "completed" ? r.discount : null,
      r.status === "completed" ? "Completed" : "In progress",
      r.coupon,
      r.campaign_name,
      formatFullDateTime(r.created_at),
      r.completed_at ? formatFullDateTime(r.completed_at) : null,
    ]
      .map(cell)
      .join(","),
  );

  // The BOM makes Excel open the file as UTF-8 (names with non-Latin characters).
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="energyfox-expo-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
