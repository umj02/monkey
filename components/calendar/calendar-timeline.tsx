import { EmptyState } from "@/components/empty-state";
import { AssetThumb } from "@/components/asset-thumb";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";

type CategoryMeta = {
  iconKey: string;
  pillClass: string;
};

function timeToMinutes(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}

function eventEndMinutes(event: CalendarEvent) {
  if (event.endTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(event.endTime)) return timeToMinutes(event.endTime);
  return timeToMinutes(event.time) + 60;
}

function findContainingLongEvent(events: CalendarEvent[], child: CalendarEvent, isLongEvent: (event: CalendarEvent) => boolean) {
  const childStart = timeToMinutes(child.time);
  return [...events]
    .filter((candidate) => candidate.id !== child.id && isLongEvent(candidate))
    .sort((a, b) => (eventEndMinutes(a) - timeToMinutes(a.time)) - (eventEndMinutes(b) - timeToMinutes(b.time)))
    .find((candidate) => {
      const start = timeToMinutes(candidate.time);
      const end = eventEndMinutes(candidate);
      return start <= childStart && end > childStart;
    }) ?? null;
}

function EventPill({
  event,
  meta,
  label,
  title,
  onEdit,
  compact = false,
  done = false,
}: {
  event: CalendarEvent;
  meta: CategoryMeta;
  label: string;
  title: string;
  onEdit: (event: CalendarEvent) => void;
  compact?: boolean;
  done?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(event)}
      className={cn(
        "flex w-full max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-[14px] text-left font-black transition active:scale-[.98]",
        compact ? "min-h-[44px] px-3 py-2 text-xs" : "min-h-[52px] px-3 py-3 text-sm sm:gap-3 sm:px-4",
        meta.pillClass,
        done && "opacity-60 grayscale",
      )}
    >
      <AssetThumb icon={meta.iconKey} size={compact ? 26 : 30} className="shrink-0 rounded-[10px] bg-white/40" />
      <span className={cn("min-w-0 flex-1 truncate", done && "line-through")}>{title}</span>
      <span className="max-w-[86px] shrink-0 truncate rounded-full bg-white/55 px-2 py-1 text-[10px] font-black opacity-80 sm:max-w-[128px]">
        {done ? "Listo" : label}
      </span>
    </button>
  );
}

export function CalendarTimeline({
  events,
  hours,
  selectedDateKey,
  expandedHourKey,
  maxVisibleEventsPerHour,
  categoryFromEvent,
  stripEmoji,
  isLongEvent,
  eventRangeLabel,
  eventsForHour,
  isCoveredByPreviousLongEvent,
  onEdit,
  onExpandHour,
  isEventDone,
}: {
  events: CalendarEvent[];
  hours: string[];
  selectedDateKey: string;
  expandedHourKey: string | null;
  maxVisibleEventsPerHour: number;
  categoryFromEvent: (event: CalendarEvent) => CategoryMeta;
  stripEmoji: (title: string) => string;
  isLongEvent: (event: CalendarEvent) => boolean;
  eventRangeLabel: (event: CalendarEvent) => string;
  eventsForHour: (events: CalendarEvent[], hour: string) => CalendarEvent[];
  isCoveredByPreviousLongEvent: (events: CalendarEvent[], hour: string) => boolean;
  containingLongEventLabel: (event: CalendarEvent) => string;
  isEventDone: (event: CalendarEvent) => boolean;
  onEdit: (event: CalendarEvent) => void;
  onExpandHour: (slotKey: string | null) => void;
}) {
  const nestedByParent = new Map<string, CalendarEvent[]>();
  const nestedChildIds = new Set<string>();

  for (const event of events) {
    const parent = findContainingLongEvent(events, event, isLongEvent);
    if (!parent) continue;
    nestedChildIds.add(event.id);
    const list = nestedByParent.get(parent.id) ?? [];
    list.push(event);
    nestedByParent.set(parent.id, list.sort((a, b) => a.time.localeCompare(b.time)));
  }

  if (events.length === 0) {
    return (
      <div className="mt-5">
        <div className="rounded-[26px] bg-white p-6 shadow-card">
          <EmptyState title="Día libre" body="Agregá una actividad con el botón verde o elegí otro día." />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 min-w-0 overflow-hidden rounded-[26px] bg-white p-4 shadow-card">
      <div className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)] gap-2 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-3">
        {hours.map((hour) => {
          const slotKey = `${selectedDateKey}-${hour}`;
          const rawSlotEvents = eventsForHour(events, hour);
          const slotEvents = rawSlotEvents.filter((event) => !nestedChildIds.has(event.id));
          const hiddenByLongEvent = isCoveredByPreviousLongEvent(events, hour);
          if (hiddenByLongEvent && slotEvents.length === 0) return null;

          const isExpanded = expandedHourKey === slotKey;
          const visibleEvents = isExpanded ? slotEvents : slotEvents.slice(0, maxVisibleEventsPerHour);
          const extraCount = !isExpanded ? Math.max(0, slotEvents.length - maxVisibleEventsPerHour) : 0;
          const nestedCount = visibleEvents.reduce((count, event) => count + (nestedByParent.get(event.id)?.length ?? 0), 0);
          const baseRows = visibleEvents.length || 1;
          const rowHeight = Math.max(72, baseRows * 66 + (nestedCount ? 20 : 0));

          return (
            <div key={hour} className="contents">
              <div className="flex items-start pt-2" style={{ minHeight: rowHeight }}>
                <p className="text-[12px] font-black text-monkey-muted">{hour}</p>
              </div>
              <div className="relative min-w-0 overflow-hidden border-b border-gray-100 pb-2 pt-1 last:border-b-0" style={{ minHeight: rowHeight }}>
                <span className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gray-100" />
                {visibleEvents.length ? (
                  <div className="space-y-2">
                    {visibleEvents.map((event) => {
                      const meta = categoryFromEvent(event);
                      const nested = nestedByParent.get(event.id) ?? [];
                      const nestedKey = `nested-${event.id}`;
                      const nestedOpen = expandedHourKey === nestedKey;
                      const long = isLongEvent(event);
                      const title = stripEmoji(event.title);
                      const label = long ? eventRangeLabel(event) : event.time;

                      return (
                        <div key={event.id} className={cn("min-w-0 overflow-hidden", nested.length ? "rounded-[18px] bg-gray-50/80 p-2" : "")}>
                          <EventPill event={event} meta={meta} label={label} title={title} onEdit={onEdit} done={isEventDone(event)} />

                          {nested.length ? (
                            <div className="mt-2 min-w-0">
                              <button
                                type="button"
                                onClick={() => onExpandHour(nestedOpen ? null : nestedKey)}
                                className="mb-2 h-8 rounded-full bg-white px-3 text-[11px] font-black text-monkey-muted shadow-sm transition active:scale-95"
                              >
                                {nestedOpen ? "Ocultar tareas anidadas" : `Ver ${nested.length} tareas anidadas`}
                              </button>

                              {nestedOpen ? (
                                <div className="space-y-1.5 border-l-4 border-white/80 pl-2">
                                  {nested.map((child) => {
                                    const childMeta = categoryFromEvent(child);
                                    return (
                                      <EventPill
                                        key={child.id}
                                        event={child}
                                        meta={childMeta}
                                        label={child.endTime ? eventRangeLabel(child) : child.time}
                                        title={stripEmoji(child.title)}
                                        onEdit={onEdit}
                                        done={isEventDone(child)}
                                        compact
                                      />
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                    {extraCount ? (
                      <button
                        type="button"
                        onClick={() => onExpandHour(slotKey)}
                        className="h-8 rounded-full bg-gray-100 px-3 text-[11px] font-black text-monkey-muted transition active:scale-95"
                      >
                        +{extraCount} más en esta hora
                      </button>
                    ) : null}
                    {isExpanded && slotEvents.length > maxVisibleEventsPerHour ? (
                      <p className="px-1 text-[10px] font-bold text-monkey-muted">Mostrando todas. Se contrae automáticamente si no editás nada.</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
