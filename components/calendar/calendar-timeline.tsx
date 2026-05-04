import { EmptyState } from "@/components/empty-state";
import { AssetThumb } from "@/components/asset-thumb";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";

type CategoryMeta = {
  iconKey: string;
  pillClass: string;
};

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
  containingLongEventLabel,
  onEdit,
  onExpandHour,
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
  onEdit: (event: CalendarEvent) => void;
  onExpandHour: (slotKey: string | null) => void;
}) {
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
    <div className="mt-4 rounded-[26px] bg-white p-4 shadow-card">
      <div className="grid grid-cols-[56px_1fr] gap-3">
        {hours.map((hour) => {
          const slotKey = `${selectedDateKey}-${hour}`;
          const slotEvents = eventsForHour(events, hour);
          const hiddenByLongEvent = isCoveredByPreviousLongEvent(events, hour);
          // Las horas cubiertas por una actividad larga solo se ocultan cuando no tienen
          // actividades propias. Si el usuario agrega algo a las 09:00 dentro de 07:00–17:00,
          // esa fila se muestra como actividad anidada.
          if (hiddenByLongEvent && slotEvents.length === 0) return null;
          const isExpanded = expandedHourKey === slotKey;
          const visibleEvents = isExpanded ? slotEvents : slotEvents.slice(0, maxVisibleEventsPerHour);
          const extraCount = !isExpanded ? Math.max(0, slotEvents.length - maxVisibleEventsPerHour) : 0;
          const rowHeight = visibleEvents.length > 1 ? Math.max(128, visibleEvents.length * 62 + 18) : visibleEvents.length === 1 ? 76 : 58;

          return (
            <div key={hour} className="contents">
              <div className="flex items-start pt-2" style={{ minHeight: rowHeight }}>
                <p className="text-[12px] font-black text-monkey-muted">{hour}</p>
              </div>
              <div className="relative border-b border-gray-100 pb-2 pt-1 last:border-b-0" style={{ minHeight: rowHeight }}>
                <span className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gray-100" />
                {visibleEvents.length ? (
                  <div className="space-y-2">
                    {hiddenByLongEvent ? (
                      <p className="px-1 text-[10px] font-black uppercase tracking-[.08em] text-monkey-muted">{containingLongEventLabel(visibleEvents[0])}</p>
                    ) : null}
                    {visibleEvents.map((event) => {
                      const meta = categoryFromEvent(event);
                      const long = isLongEvent(event);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => onEdit(event)}
                          className={cn(
                            "flex min-h-[52px] w-full min-w-0 items-center gap-3 overflow-hidden rounded-[14px] px-4 py-3 text-left text-sm font-black transition active:scale-[.98]",
                            meta.pillClass,
                          )}
                        >
                          <AssetThumb icon={meta.iconKey} size={30} className="rounded-[10px] bg-white/40" />
                          <span className="min-w-0 flex-1 truncate">{stripEmoji(event.title)}</span>
                          <span className="shrink-0 rounded-full bg-white/55 px-2 py-1 text-[10px] font-black opacity-80">
                            {long ? eventRangeLabel(event) : event.time}
                          </span>
                        </button>
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
