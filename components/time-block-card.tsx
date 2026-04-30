"use client";

import { Check } from "lucide-react";
import type { TimeBlock } from "@/types";
import { cn } from "@/lib/utils";

const colorMap = {
  green: "bg-green-50 border-green-100",
  yellow: "bg-yellow-50 border-yellow-100",
  purple: "bg-purple-50 border-purple-100",
  blue: "bg-sky-50 border-sky-100",
  pink: "bg-pink-50 border-pink-100",
  orange: "bg-orange-50 border-orange-100"
};

export function TimeBlockCard({
  block,
  onToggle
}: {
  block: TimeBlock;
  onToggle: (blockId: string, taskId: string) => void;
}) {
  return (
    <article className={cn("rounded-monkey border p-4 shadow-sm", colorMap[block.color])}>
      <div className="flex items-start gap-3">
        <div className="w-14 shrink-0 text-sm font-bold text-monkey-purple">{block.time}</div>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 font-semibold">
            <span>{block.emoji}</span>
            {block.title}
          </h3>
          <div className="mt-3 space-y-2">
            {block.tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onToggle(block.id, task.id)}
                className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-white/75 px-3 py-2 text-left text-sm"
              >
                <span className={cn(
                  "grid h-5 w-5 place-items-center rounded-md border",
                  task.done ? "border-monkey-green bg-monkey-green text-white" : "border-gray-300 bg-white"
                )}>
                  {task.done ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
                <span className={cn(task.done && "text-gray-400 line-through")}>{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
