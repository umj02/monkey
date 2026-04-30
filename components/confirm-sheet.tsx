"use client";

import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmSheet({ open, title, body, confirmLabel = "Eliminar", onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] mx-auto grid max-w-[430px] place-items-end bg-black/50 px-5 pb-6">
      <section className="w-full animate-slideUp rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-pink-100 text-monkey-pink"><AlertTriangle className="h-5 w-5" /></span>
          <div className="flex-1"><h2 className="text-lg font-black text-monkey-ink">{title}</h2><p className="mt-1 text-sm leading-6 text-monkey-muted">{body}</p></div>
          <button onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-full bg-gray-100" aria-label="Cancelar"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="h-12 rounded-pill bg-gray-100 text-sm font-black text-monkey-ink">Cancelar</button>
          <button onClick={onConfirm} className="h-12 rounded-pill bg-pink-100 text-sm font-black text-monkey-pink">{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
