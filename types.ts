export type Task = {
  id: string;
  title: string;
  done: boolean;
};

export type TimeBlock = {
  id: string;
  time: string;
  title: string;
  emoji: string;
  color: "green" | "yellow" | "purple" | "blue" | "pink" | "orange";
  tasks: Task[];
};
