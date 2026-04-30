"use client";

import { CheckCircle2, Info, X } from "lucide-react";

export type ToastState = { message: string; type?: "success" | "info" | "error" } | null;

export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  if (!toast) return null;
  const Icon = toast.type === "success" ? CheckCircle2 : Info;
  return (
    <div className="fixed left-1/2 top-5 z-[70] w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 animate-pop rounded-[20px] border border-black/5 bg-white/95 p-3 shadow-soft backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-green-100 text-monkey-green"><Icon className="h-5 w-5" /></span>
        <p className="flex-1 text-sm font-bold text-monkey-ink">{toast.message}</p>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-monkey-muted" aria-label="Cerrar aviso"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
