"use client";

import { Bell, BellOff, Check } from "lucide-react";
import { AssetThumb } from "@/components/asset-thumb";
import type { Task, TimeBlock } from "@/types";
import { cn } from "@/lib/utils";

const styleMap = {
  purple: "bg-purple-50 border-purple-100 text-monkey-purple",
  green: "bg-green-50 border-green-100 text-monkey-greenDark",
  orange: "bg-orange-50 border-orange-100 text-monkey-orange",
  blue: "bg-sky-50 border-sky-100 text-sky-600",
  pink: "bg-pink-50 border-pink-100 text-monkey-pink",
  yellow: "bg-yellow-50 border-yellow-100 text-orange-600"
};

function reminderTime(reminderAt?: string | null) {
  if (!reminderAt) return "Sin recordatorio";
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return "Recordatorio activo";
  return date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
}

export function TimeBlockCard({
  block,
  onToggle,
  onOpen,
  onTaskOpen
}: {
  block: TimeBlock;
  onToggle: (blockId: string, taskId: string) => void;
  onOpen?: (block: TimeBlock) => void;
  onTaskOpen?: (block: TimeBlock, task: Task) => void;
}) {
  return (
    <article className={cn("animate-slideUp rounded-card border p-4 shadow-sm", styleMap[block.color])}>
      <div className="grid min-w-0 grid-cols-[54px_minmax(0,1fr)] gap-1">
        <div className="pt-1 text-[13px] font-black">{block.time}</div>
        <div className="min-w-0">
          <button type="button" onClick={() => onOpen?.(block)} className="flex max-w-full min-w-0 items-center text-left text-[15px] font-black text-monkey-ink">
            <AssetThumb icon={block.icon} size={28} className="mr-2 shrink-0 rounded-[10px] bg-white/60 p-1" /><span className="min-w-0 truncate">{block.title}</span>
          </button>
          <div className="mt-2 space-y-2">
            {block.tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onTaskOpen ? onTaskOpen(block, task) : onToggle(block.id, task.id)}
                className="flex min-h-10 w-full min-w-0 items-center gap-2 overflow-hidden rounded-[14px] bg-white/75 px-3 text-left text-[13px] text-monkey-ink transition active:scale-[.98]"
              >
                <span className={cn("min-w-0 flex-1 truncate", task.done && "text-gray-400 line-through")}>{task.title}</span>
                {task.reminderAt ? (
                  <span className="shrink-0 rounded-pill bg-green-50 px-2 py-1 text-[10px] font-black text-monkey-green">
{reminderTime(task.reminderAt).replace(" a. m.", "").replace(" p. m.", "")}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full transition",
                    task.reminderAt ? "bg-green-100 text-monkey-green" : "bg-gray-100 text-gray-400"
                  )}
                  title={reminderTime(task.reminderAt)}
                  aria-label={reminderTime(task.reminderAt)}
                >
                  {task.reminderAt ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </span>
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-md border transition",
                    task.done ? "animate-checkPulse border-monkey-green bg-monkey-green text-white" : "border-gray-300 bg-white"
                  )}
                  onClick={(event) => { event.stopPropagation(); onToggle(block.id, task.id); }}
                >
                  {task.done ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
