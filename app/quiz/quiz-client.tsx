"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { ArrowRight, Check, CircleAlert, Gift, Lightbulb, ListChecks, LoaderCircle, X } from "lucide-react";
import { submitAnswer } from "@/app/actions";

export type QuizQuestion = {
  id: string;
  question: string;
  /** "Select all that apply": several options are correct. */
  multiple: boolean;
  /** Options in this player's display order; `index` is the option's original position. */
  options: { index: number; text: string }[];
  answered: { choice: number[]; answer: number[]; fact?: string } | null;
};

type OptionStatus = "idle" | "selected" | "pending" | "correct" | "missed" | "wrong" | "dim";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const BRAND_COLORS = ["#F99D1C", "#FFC65C", "#FFE3A8", "#FFFFFF"];
const EASE = [0.2, 0.8, 0.2, 1] as const;

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((i) => b.includes(i));
const isRight = (q: QuizQuestion) => q.answered !== null && sameSet(q.answered.choice, q.answered.answer);

// Long technical questions get a smaller size so they fit on a phone screen.
function questionSize(text: string) {
  if (text.length > 130) return "text-[1.2rem]";
  if (text.length > 80) return "text-[1.35rem]";
  return "text-[1.55rem]";
}

export function QuizClient({ firstName, questions: initial }: { firstName: string; questions: QuizQuestion[] }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initial);
  const [index, setIndex] = useState(() => {
    const firstOpen = initial.findIndex((q) => !q.answered);
    return firstOpen === -1 ? initial.length - 1 : firstOpen;
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [leaving, setLeaving] = useState(false);

  const current = questions[index];
  const result = current.answered;
  const isLast = index === questions.length - 1;
  const correctCount = questions.filter(isRight).length;
  const answeredCount = questions.filter((q) => q.answered).length;

  function submit(choice: number[], target: HTMLElement) {
    if (result || isPending) return;
    setSubmitting(choice);
    setError(null);
    const questionId = current.id;
    startTransition(async () => {
      const res = await submitAnswer(questionId, choice);
      setSubmitting(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSelected([]);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, answered: { choice: res.choice, answer: res.answer, fact: res.fact } } : q,
        ),
      );
      if (res.correct) celebrate(target);
      else navigator.vibrate?.(120);
    });
  }

  function pick(option: number, target: HTMLElement) {
    if (result || isPending) return;
    if (current.multiple) {
      setSelected((s) => (s.includes(option) ? s.filter((i) => i !== option) : [...s, option]));
    } else {
      submit([option], target);
    }
  }

  function next() {
    if (isLast) {
      setLeaving(true);
      router.push("/result");
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function statusFor(option: number): OptionStatus {
    if (!result) {
      if (!current.multiple && submitting?.includes(option)) return "pending";
      return selected.includes(option) ? "selected" : "idle";
    }
    const chosen = result.choice.includes(option);
    if (result.answer.includes(option)) return chosen || !current.multiple ? "correct" : "missed";
    return chosen ? "wrong" : "dim";
  }

  const answeredRight = isRight(current);

  return (
    <div className="flex flex-1 flex-col pt-5">
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold text-white/85">Hi {firstName} 👋</p>
        <p className="glass flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-emerald-300">
          <Check className="size-3.5" strokeWidth={3} />
          {correctCount} correct
        </p>
      </div>

      <div
        className="mt-4 flex gap-1.5"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={answeredCount}
      >
        {questions.map((q, i) => {
          const state = q.answered
            ? isRight(q)
              ? "bg-emerald-400"
              : "bg-rose-400"
            : i === index
              ? "bg-sun-400 shadow-[0_0_14px_rgb(249_157_28/0.9)]"
              : "bg-white/15";
          return <span key={q.id} className={`h-2 flex-1 rounded-full transition-all duration-500 ${state}`} />;
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={current.id}
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -48 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-8 flex flex-1 flex-col"
        >
          <p className="text-xs font-bold tracking-[0.22em] text-sun-300 uppercase">
            Question {index + 1} <span className="text-white/40">of {questions.length}</span>
          </p>
          <h1 className={`mt-2.5 font-display leading-snug font-semibold text-balance ${questionSize(current.question)}`}>
            {current.question}
          </h1>
          {current.multiple && (
            <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-sun-500/15 px-3 py-1 text-xs font-semibold text-sun-200 ring-1 ring-sun-400/30">
              <ListChecks className="size-3.5" />
              Select all that apply
            </p>
          )}

          <ul className="mt-6 space-y-3">
            {current.options.map((option, i) => (
              <motion.li
                key={option.index}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.35, ease: EASE }}
              >
                <OptionButton
                  letter={LETTERS[i]}
                  text={option.text}
                  multiple={current.multiple}
                  status={statusFor(option.index)}
                  disabled={Boolean(result) || isPending}
                  onPick={(el) => pick(option.index, el)}
                />
              </motion.li>
            ))}
          </ul>

          {current.multiple && !result && (
            <button
              type="button"
              disabled={selected.length === 0 || isPending}
              onClick={(e) => submit(selected, e.currentTarget)}
              className="btn-sun mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? <LoaderCircle className="size-5 animate-spin" /> : <Check className="size-5" strokeWidth={3} />}
              Check answer
            </button>
          )}

          {error && (
            <p role="alert" className="mt-4 flex gap-2.5 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3.5 text-sm text-rose-100">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-5 pb-2"
                aria-live="polite"
              >
                <div
                  className={`rounded-2xl border p-4 ${
                    answeredRight ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="font-display text-lg font-semibold">
                    {answeredRight
                      ? "Correct! 🎉"
                      : current.multiple
                        ? "Not quite: the green options were all correct"
                        : "Not quite, but good try!"}
                  </p>
                  {result.fact && (
                    <p className="mt-1.5 flex gap-2 text-sm leading-relaxed text-white/75">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-sun-300" />
                      {result.fact}
                    </p>
                  )}
                </div>
                <button
                  onClick={next}
                  disabled={leaving}
                  autoFocus
                  className="btn-sun group mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition active:scale-[0.98]"
                >
                  {leaving ? (
                    <>
                      <LoaderCircle className="size-5 animate-spin" />
                      Revealing your reward…
                    </>
                  ) : isLast ? (
                    <>
                      See my reward
                      <Gift className="size-5 transition-transform group-hover:scale-110" />
                    </>
                  ) : (
                    <>
                      Next question
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

const STATUS_STYLES: Record<OptionStatus, { button: string; badge: string }> = {
  idle: {
    button: "border-white/10 bg-white/[0.06] hover:border-white/25 hover:bg-white/10 active:scale-[0.98]",
    badge: "bg-white/10 text-white/80",
  },
  selected: {
    button: "border-sun-400/80 bg-sun-500/15",
    badge: "bg-sun-500 text-navy-900",
  },
  pending: {
    button: "border-sun-400/80 bg-sun-500/15 shadow-[0_0_24px_-6px_rgb(249_157_28/0.7)]",
    badge: "bg-sun-500 text-navy-900",
  },
  correct: {
    button: "border-emerald-400/80 bg-emerald-400/15 shadow-[0_0_24px_-6px_rgb(52_211_153/0.6)]",
    badge: "bg-emerald-400 text-navy-900",
  },
  missed: {
    button: "border-dashed border-emerald-400/70 bg-emerald-400/[0.06]",
    badge: "bg-emerald-400/25 text-emerald-200",
  },
  wrong: {
    button: "border-rose-400/80 bg-rose-500/15",
    badge: "bg-rose-400 text-navy-900",
  },
  dim: {
    button: "border-white/5 bg-white/[0.03] opacity-45",
    badge: "bg-white/10 text-white/60",
  },
};

function OptionButton({
  letter,
  text,
  multiple,
  status,
  disabled,
  onPick,
}: {
  letter: string;
  text: string;
  multiple: boolean;
  status: OptionStatus;
  disabled: boolean;
  onPick: (el: HTMLElement) => void;
}) {
  const styles = STATUS_STYLES[status];
  const showCheck = status === "correct" || status === "missed" || (status === "selected" && multiple);
  return (
    <motion.button
      type="button"
      disabled={disabled}
      aria-pressed={multiple ? status === "selected" : undefined}
      onClick={(e) => onPick(e.currentTarget)}
      animate={
        status === "wrong"
          ? { x: [0, -9, 9, -6, 6, -3, 0] }
          : status === "correct"
            ? { scale: [1, 1.03, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{ duration: 0.45 }}
      className={`flex min-h-16 w-full items-center gap-3.5 rounded-2xl border px-4 py-3 text-left backdrop-blur-md transition-colors duration-300 disabled:cursor-default ${styles.button}`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center font-display text-sm font-bold transition-colors duration-300 ${
          multiple ? "rounded-lg" : "rounded-xl"
        } ${styles.badge}`}
      >
        {showCheck ? (
          <Check className="size-5" strokeWidth={3} />
        ) : status === "wrong" ? (
          <X className="size-5" strokeWidth={3} />
        ) : (
          letter
        )}
      </span>
      <span className="flex-1 text-[1.02rem] leading-snug font-medium">{text}</span>
      {status === "pending" && <LoaderCircle className="size-5 shrink-0 animate-spin text-sun-300" />}
    </motion.button>
  );
}

function celebrate(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  confetti({
    particleCount: 45,
    spread: 75,
    startVelocity: 30,
    scalar: 0.85,
    ticks: 140,
    origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
  });
}
