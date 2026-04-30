import { ReactNode } from "react";
import { MonkeyAvatar } from "@/components/monkey-avatar";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className="soft-card px-5 py-7 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-50"><MonkeyAvatar size={58} variant="face" /></div>
      <h2 className="mt-4 text-base font-black text-monkey-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-monkey-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
