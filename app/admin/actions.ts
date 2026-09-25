"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  endAdminSession,
  isAdminConfigured,
  requireAdmin,
  startAdminSession,
} from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { randomCode } from "@/lib/random";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "ADMIN_PASSWORD isn't set. Add it to the project's environment variables first." };
  }
  if (!checkPassword(String(formData.get("password") ?? ""))) {
    await new Promise((resolve) => setTimeout(resolve, 700)); // slow down guessing
    return { error: "Incorrect password. Please try again." };
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

export type CreateQrState = { error?: string; createdAt?: number };

export async function createCampaign(_prev: CreateQrState, formData: FormData): Promise<CreateQrState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) {
    return { error: "Give the QR code a name between 2 and 80 characters." };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const [row] = await query<{ id: number }>(
      "INSERT INTO campaigns (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING RETURNING id",
      [randomCode(8, "abcdefghjkmnpqrstuvwxyz23456789"), name],
    );
    if (row) {
      revalidatePath("/admin", "layout");
      return { createdAt: Date.now() };
    }
  }
  return { error: "Couldn't create the QR code. Please try again." };
}

function assertId(id: unknown): asserts id is number {
  if (!Number.isInteger(id)) throw new Error("Invalid id");
}

export async function toggleCampaign(id: number) {
  await requireAdmin();
  assertId(id);
  await query("UPDATE campaigns SET active = NOT active WHERE id = $1", [id]);
  revalidatePath("/admin", "layout");
}

export async function deleteCampaign(id: number) {
  await requireAdmin();
  assertId(id);
  // Leads from this QR are kept; their source just becomes empty.
  await query("DELETE FROM campaigns WHERE id = $1", [id]);
  revalidatePath("/admin", "layout");
}

export async function deleteLead(id: number) {
  await requireAdmin();
  assertId(id);
  await query("DELETE FROM leads WHERE id = $1", [id]);
  revalidatePath("/admin", "layout");
}
