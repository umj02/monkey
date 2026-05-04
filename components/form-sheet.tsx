"use client";

import { X } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useState } from "react";

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

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] items-end overflow-hidden bg-black/50 px-4 pb-[calc(10px+var(--safe-bottom))] pt-[calc(18px+var(--safe-top))] sm:px-5">
      <form
        onSubmit={handleSubmit}
        className="flex h-[min(86dvh,740px)] max-h-[calc(100dvh-24px-var(--safe-top)-var(--safe-bottom))] w-full min-w-0 animate-slideUp touch-pan-y flex-col overflow-hidden rounded-[30px] bg-white shadow-soft"
      >
        <div className="shrink-0 border-b border-gray-100/80 bg-white px-5 pb-3 pt-4">
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
        </div>

        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
          <div className="min-w-0 space-y-4">{children}</div>
        </div>

        <div className="shrink-0 border-t border-gray-100/80 bg-white px-5 pb-[calc(12px+var(--safe-bottom))] pt-3">
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
