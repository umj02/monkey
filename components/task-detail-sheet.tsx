import { Check, Trash2, X } from "lucide-react";
import { MonkeyAvatar } from "@/components/monkey-avatar";

export function TaskDetailSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[430px] bg-black/55 px-5 pb-6 pt-20">
      <section className="animate-pop rounded-[28px] bg-white p-5 shadow-soft">
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-gray-100">
          <X className="h-5 w-5" />
        </button>
        <div className="flex justify-center"><MonkeyAvatar size={92} variant="full" imageClassName="object-bottom" /></div>
        <h2 className="mt-2 text-2xl font-black">Ejercicio 💪</h2>
        <p className="mt-1 text-sm font-semibold text-monkey-muted">07:00 - 08:00</p>
        <div className="mt-4 space-y-2">
          {["Hacer estiramientos", "Correr 20 min", "Beber agua"].map((item, index) => (
            <div key={item} className="flex h-10 items-center gap-3 text-sm">
              <span className={index < 2 ? "grid h-5 w-5 place-items-center rounded-md bg-monkey-green text-white" : "h-5 w-5 rounded-md border border-gray-300"}>
                {index < 2 ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          <button className="flex-1 rounded-pill bg-monkey-green px-5 py-4 text-sm font-bold text-white">Editar tarea</button>
          <button className="grid w-14 place-items-center rounded-pill bg-pink-100 text-monkey-pink">
            <Trash2 />
          </button>
        </div>
      </section>
    </div>
  );
}
