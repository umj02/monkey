"use client";

import { X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

export type FormSheetSubmitState = "idle" | "submitting" | "error";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  submitLabel?: string;
  submittingLabel?: string;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

export function FormSheet({
  open,
  title,
  subtitle,
  children,
  submitLabel = "Guardar",
  submittingLabel = "Guardando...",
  onClose,
  onSubmit,
}: Props) {
  const [submitState, setSubmitState] = useState<FormSheetSubmitState>("idle");

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "submitting") return;
    try {
      setSubmitState("submitting");
      await onSubmit();
      setSubmitState("idle");
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] items-end overflow-hidden bg-black/50 px-4 pb-[calc(18px+var(--safe-bottom))] pt-[calc(56px+var(--safe-top))] sm:px-5">
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100dvh-96px-var(--safe-top)-var(--safe-bottom))] w-full min-w-0 animate-slideUp overflow-y-auto overflow-x-hidden overscroll-contain rounded-[28px] bg-white p-5 pb-4 shadow-soft"
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black tracking-tight text-monkey-ink">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-5 text-monkey-muted">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100 transition active:scale-95"
            aria-label="Cerrar"
            disabled={submitState === "submitting"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 min-w-0 space-y-4">{children}</div>

        <div className="sticky bottom-0 -mx-5 mt-6 bg-gradient-to-t from-white via-white to-white/80 px-5 pb-1 pt-3">
          {submitState === "error" ? (
            <p className="mb-2 rounded-[14px] bg-pink-50 px-3 py-2 text-xs font-bold text-monkey-pink">
              No se pudo completar la acción. Revisá los datos e intentá de nuevo.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitState === "submitting"}
            className="h-14 w-full rounded-pill bg-monkey-green text-sm font-black text-white shadow-float transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitState === "submitting" ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
