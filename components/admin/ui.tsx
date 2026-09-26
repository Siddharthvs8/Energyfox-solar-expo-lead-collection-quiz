export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900 lg:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-navy-100 bg-white shadow-[0_1px_2px_rgb(25_38_73/0.04)] ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-navy-100 px-5 py-4">
      <div>
        <h2 className="font-semibold text-navy-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-navy-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-sm font-medium text-navy-500">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-navy-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-navy-400">{detail}</p>}
    </Card>
  );
}

const DISCOUNT_STYLES: Record<number, string> = {
  15: "bg-sun-500 text-navy-900",
  10: "bg-sun-200 text-sun-900",
  5: "bg-sun-100 text-sun-800",
  0: "bg-navy-100 text-navy-600",
};

export function DiscountBadge({ discount, status }: { discount: number; status: string }) {
  if (status !== "completed") {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-navy-500">
        Not spun yet
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${
        DISCOUNT_STYLES[discount] ?? DISCOUNT_STYLES[0]
      }`}
    >
      {discount}% off
    </span>
  );
}

export const buttonStyles = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-navy-800 px-4 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60",
  accent:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sun-500 px-4 text-sm font-semibold text-navy-900 transition hover:bg-sun-400 disabled:opacity-60",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-4 text-sm font-semibold text-navy-700 transition hover:border-navy-300 hover:bg-navy-50 disabled:opacity-60",
  ghost:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-navy-500 transition hover:bg-navy-50 hover:text-navy-800",
};
