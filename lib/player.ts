import { cookies } from "next/headers";
import { query, type Lead } from "./db";

/** Remembers which lead this browser belongs to, so players can resume. */
export const PLAYER_COOKIE = "efx_player";

export const PLAYER_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} as const;

export async function getCurrentLead() {
  const token = (await cookies()).get(PLAYER_COOKIE)?.value;
  if (!token) return null;
  const [lead] = await query<Lead>("SELECT * FROM leads WHERE token = $1", [token]);
  return lead ?? null;
}
