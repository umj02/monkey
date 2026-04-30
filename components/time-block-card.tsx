"use client";

import { Check } from "lucide-react";
import type { TimeBlock } from "@/types";
import { cn } from "@/lib/utils";

const styleMap = {
  purple: "bg-purple-50 border-purple-100 text-monkey-purple",
  green: "bg-green-50 border-green-100 text-monkey-greenDark",
  orange: "bg-orange-50 border-orange-100 text-monkey-orange",
  blue: "bg-sky-50 border-sky-100 text-sky-600",
  pink: "bg-pink-50 border-pink-100 text-monkey-pink",
  yellow: "bg-yellow-50 border-yellow-100 text-orange-600"
};

export function TimeBlockCard({
  block,
  onToggle,
  onOpen
}: {
  block: TimeBlock;
  onToggle: (blockId: string, taskId: string) => void;
  onOpen?: (block: TimeBlock) => void;
}) {
  return (
    <article className={cn("animate-slideUp rounded-card border p-4 shadow-sm", styleMap[block.color])}>
      <div className="grid grid-cols-[54px_1fr] gap-1">
        <div className="pt-1 text-[13px] font-black">{block.time}</div>
        <div>
          <button type="button" onClick={() => onOpen?.(block)} className="text-left text-[15px] font-black text-monkey-ink">
            <span className="mr-2">{block.icon}</span>{block.title}
          </button>
          <div className="mt-2 space-y-2">
            {block.tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggle(block.id, task.id)}
                className="flex min-h-9 w-full items-center justify-between rounded-[14px] bg-white/75 px-3 text-left text-[13px] text-monkey-ink transition active:scale-[.98]"
              >
                <span className={cn(task.done && "text-gray-400 line-through")}>{task.title}</span>
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-md border transition",
                    task.done ? "animate-checkPulse border-monkey-green bg-monkey-green text-white" : "border-gray-300 bg-white"
                  )}
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
