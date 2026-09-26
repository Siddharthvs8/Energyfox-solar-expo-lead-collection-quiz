"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query, type Lead } from "@/lib/db";
import { normalizeMobile } from "@/lib/phone";
import { getCurrentLead, PLAYER_COOKIE, PLAYER_COOKIE_OPTIONS } from "@/lib/player";
import type { PrizeId } from "@/lib/prizes";
import { randomToken } from "@/lib/random";
import { spinForLead } from "@/lib/spin";

export type RegisterState = {
  error?: string;
  fieldErrors?: { name?: string; phone?: string };
  values?: { name: string; phone: string };
};

export async function register(
  code: string,
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const phoneInput = String(formData.get("phone") ?? "").trim();
  const values = { name, phone: phoneInput };

  const fieldErrors: NonNullable<RegisterState["fieldErrors"]> = {};
  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  else if (name.length > 60) fieldErrors.name = "Please keep your name under 60 characters.";
  const mobile = normalizeMobile(phoneInput);
  if (!mobile) fieldErrors.phone = "Please enter a valid 10-digit mobile number.";
  if (fieldErrors.name || fieldErrors.phone) return { fieldErrors, values };

  const [campaign] = await query<{ id: number }>(
    "SELECT id FROM campaigns WHERE code = $1 AND active",
    [code],
  );
  if (!campaign) {
    return { error: "This QR code is no longer active. Please ask the Energyfox team for help.", values };
  }

  const [created] = await query<Pick<Lead, "token">>(
    `INSERT INTO leads (token, name, phone, phone_key, campaign_id, status)
     VALUES ($1, $2, $3, $4, $5, 'registered')
     ON CONFLICT (phone_key) DO NOTHING
     RETURNING token`,
    [randomToken(), name, `+91${mobile}`, mobile, campaign.id],
  );

  let token = created?.token;
  if (!token) {
    // One spin per mobile number.
    const [existing] = await query<Pick<Lead, "token" | "status" | "discount">>(
      "SELECT token, status, discount FROM leads WHERE phone_key = $1",
      [mobile],
    );
    if (!existing) return { error: "Something went wrong. Please try again.", values };
    if (existing.status === "completed") {
      return {
        error:
          existing.discount > 0
            ? `This number has already spun and won ${existing.discount}% off. Each mobile number gets one spin.`
            : "This number has already taken part. Each mobile number gets one spin.",
        values,
      };
    }
    // Registered but never spun (e.g. they switched phones): let them spin now.
    token = existing.token;
  }

  (await cookies()).set(PLAYER_COOKIE, token, PLAYER_COOKIE_OPTIONS);
  redirect("/spin");
}

/** "Not you?": forget this browser's player so someone else can register on it. */
export async function switchPlayer(code: string) {
  (await cookies()).delete(PLAYER_COOKIE);
  redirect(`/play/${encodeURIComponent(code)}`);
}

export type SpinResult =
  | { ok: true; prize: PrizeId; discount: number; coupon: string | null }
  | { ok: false; error: string };

/** The server decides the prize; the wheel then animates to it. */
export async function spinWheel(): Promise<SpinResult> {
  const lead = await getCurrentLead();
  if (!lead) return { ok: false, error: "Your session has expired. Please scan the QR code again." };

  const spun = await spinForLead(lead);
  if (!spun.prize) return { ok: false, error: "You've already taken part. Your reward is on the next screen." };
  return { ok: true, prize: spun.prize, discount: spun.discount, coupon: spun.coupon };
}
