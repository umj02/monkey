export const STORAGE_KEYS = {
  taskBlocks: "monkey.taskBlocks.v24",
  calendarEvents: "monkey.calendarEvents.v24",
  notes: "monkey.notes.v24",
  reminders: "monkey.reminders.v24",
  profile: "monkey.profile.v24",
  settings: "monkey.settings.v24",
  authSession: "monkey.authSession.v24"
} as const;

export const LEGACY_STORAGE_KEYS = {
  taskBlocks: ["monkey.today.blocks.v23"],
  calendarEvents: ["monkey.calendar.v23"],
  notes: ["monkey.notes.v23"],
  reminders: ["monkey.reminders.v23"],
  profile: ["monkey.profile.v23"],
  settings: ["monkey.settings.v22"]
} as const;
