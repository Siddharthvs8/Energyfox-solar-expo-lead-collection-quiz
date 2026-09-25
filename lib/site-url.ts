import { headers } from "next/headers";

/**
 * Base URL encoded into the QR codes. On Vercel this is the project's
 * production domain (even when the admin panel is opened on a preview URL);
 * set SITE_URL to override it.
 */
export async function getSiteUrl() {
  const configured =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  if (configured) return configured.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
