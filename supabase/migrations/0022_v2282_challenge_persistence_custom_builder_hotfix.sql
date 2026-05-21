-- Monkey Checks v2.28.2 — Challenge Persistence + Custom Challenge Builder Hotfix
-- Safe additive hardening. No destructive changes.

create index if not exists calendar_events_user_challenge_task_idx
  on public.calendar_events (user_id, challenge_id, challenge_task_id);

create index if not exists challenge_tasks_user_calendar_event_idx
  on public.challenge_tasks (user_id, calendar_event_id);

create index if not exists personal_challenges_user_claimed_idx
  on public.personal_challenges (user_id, claimed_at, status);

notify pgrst, 'reload schema';
