"use client";

import { X } from "lucide-react";
import { FormEvent, ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
};

export function FormSheet({ open, title, subtitle, children, submitLabel = "Guardar", onClose, onSubmit }: Props) {
  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] items-end overflow-hidden bg-black/50 px-4 pb-[calc(18px+var(--safe-bottom))] pt-14 sm:px-5">
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100dvh-88px)] w-full min-w-0 animate-slideUp overflow-y-auto overflow-x-hidden rounded-[28px] bg-white p-5 pb-4 shadow-soft"
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black tracking-tight text-monkey-ink">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-5 text-monkey-muted">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 min-w-0 space-y-4">{children}</div>
        <div className="sticky bottom-0 -mx-5 mt-6 bg-gradient-to-t from-white via-white to-white/80 px-5 pb-1 pt-3"><button type="submit" className="h-14 w-full rounded-pill bg-monkey-green text-sm font-black text-white shadow-float transition active:scale-95">{submitLabel}</button></div>
      </form>
    </div>
  );
}
