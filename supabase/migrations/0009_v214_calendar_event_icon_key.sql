-- Monkey Checks v2.14
-- Permite conservar el ícono elegido desde Hoy/Calendario en las actividades compartidas.

alter table public.calendar_events
  add column if not exists icon_key text;

create index if not exists calendar_events_user_date_time_idx
  on public.calendar_events (user_id, event_date, start_time);
