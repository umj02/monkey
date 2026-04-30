export type TaskColor = "purple" | "green" | "orange" | "blue" | "pink" | "yellow";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  reminderAt?: string | null;
};

export type TimeBlock = {
  id: string;
  date?: string;
  time: string;
  title: string;
  color: TaskColor;
  icon: string;
  tasks: Task[];
};

export type Note = {
  id: string;
  title: string;
  body: string;
  color: "yellow" | "pink" | "green" | "blue" | "purple";
  createdAt: string;
};

export type Reminder = {
  id: string;
  title: string;
  time: string;
  repeat: "daily" | "weekly" | "custom";
  enabled: boolean;
  taskId?: string | null;
};

export type CalendarEvent = {
  id: string;
  time: string;
  title: string;
  color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange";
};

export type Profile = {
  name: string;
  email: string;
};

export type Settings = {
  darkMode: boolean;
  sounds: boolean;
  sync: boolean;
  theme: "colorful" | "soft";
};
