"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query, type Lead } from "@/lib/db";
import { completeIfFinished } from "@/lib/leads";
import { normalizeMobile } from "@/lib/phone";
import { getCurrentLead, PLAYER_COOKIE, PLAYER_COOKIE_OPTIONS } from "@/lib/player";
import { correctAnswers, getQuestion, isCorrect, isMultiple, pickQuestionIds, toChoice } from "@/lib/quiz";
import { randomToken } from "@/lib/random";

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
    `INSERT INTO leads (token, name, phone, phone_key, campaign_id, question_ids)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     ON CONFLICT (phone_key) DO NOTHING
     RETURNING token`,
    [randomToken(), name, `+91${mobile}`, mobile, campaign.id, JSON.stringify(pickQuestionIds())],
  );

  let token = created?.token;
  if (!token) {
    // One entry per mobile number.
    const [existing] = await query<Pick<Lead, "token" | "status" | "discount">>(
      "SELECT token, status, discount FROM leads WHERE phone_key = $1",
      [mobile],
    );
    if (!existing) return { error: "Something went wrong. Please try again.", values };
    if (existing.status === "completed") {
      return {
        error:
          existing.discount > 0
            ? `This number has already played and unlocked ${existing.discount}% off. Each mobile number can play only once.`
            : "This number has already played. Each mobile number can play only once.",
        values,
      };
    }
    // Unfinished quiz (e.g. they switched phones): pick up where they left off.
    token = existing.token;
  }

  (await cookies()).set(PLAYER_COOKIE, token, PLAYER_COOKIE_OPTIONS);
  redirect("/quiz");
}

/** "Not you?": forget this browser's player so someone else can register on it. */
export async function switchPlayer(code: string) {
  (await cookies()).delete(PLAYER_COOKIE);
  redirect(`/play/${encodeURIComponent(code)}`);
}

export type AnswerResult =
  | { ok: true; choice: number[]; correct: boolean; answer: number[]; fact?: string; finished: boolean }
  | { ok: false; error: string };

/** `choice` holds the picked option indexes (one, or several for "select all that apply"). */
export async function submitAnswer(questionId: string, choice: number[]): Promise<AnswerResult> {
  const lead = await getCurrentLead();
  if (!lead) return { ok: false, error: "Your session has expired. Please scan the QR code again." };

  const question = getQuestion(questionId);
  if (!question || !lead.question_ids.includes(questionId)) {
    return { ok: false, error: "That question isn't part of your quiz." };
  }
  const picked = Array.isArray(choice) ? [...new Set(choice)].sort((a, b) => a - b) : [];
  const valid =
    picked.length > 0 &&
    (isMultiple(question) || picked.length === 1) &&
    picked.every((i) => Number.isInteger(i) && i >= 0 && i < question.options.length);
  if (!valid) return { ok: false, error: "Please choose one of the options." };

  // The first answer is final: the WHERE clause refuses to overwrite it.
  const [updated] = await query<Pick<Lead, "answers">>(
    `UPDATE leads
        SET answers = answers || jsonb_build_object($2::text, $3::jsonb)
      WHERE id = $1 AND status = 'playing' AND (answers -> $2::text) IS NULL
      RETURNING answers`,
    [lead.id, questionId, JSON.stringify(picked)],
  );

  let answers = updated?.answers;
  if (!answers) {
    const [fresh] = await query<Pick<Lead, "answers">>("SELECT answers FROM leads WHERE id = $1", [lead.id]);
    answers = fresh?.answers ?? {};
  }
  const stored = answers[questionId];
  if (stored === undefined) return { ok: false, error: "Something went wrong. Please try again." };

  const finished = await completeIfFinished(lead, answers);
  return {
    ok: true,
    choice: toChoice(stored),
    correct: isCorrect(question, stored),
    answer: correctAnswers(question),
    fact: question.fact,
    finished,
  };
}
