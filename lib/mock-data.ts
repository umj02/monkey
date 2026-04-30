import type { Note, Reminder, TimeBlock } from "@/types";

export const todaySeed: TimeBlock[] = [
  { id: "wake", time: "06:00", title: "Despertar", color: "purple", icon: "☀️", tasks: [
    { id: "a", title: "Lavarme los dientes", done: true },
    { id: "b", title: "Tomar agua", done: true }
  ]},
  { id: "sport", time: "07:00", title: "Ejercicio", color: "orange", icon: "🏃‍♂️", tasks: [
    { id: "c", title: "Hacer estiramientos", done: false },
    { id: "d", title: "Correr 20 min", done: false }
  ]},
  { id: "study", time: "08:00", title: "Estudiar", color: "green", icon: "📚", tasks: [
    { id: "e", title: "Matemáticas", done: false },
    { id: "f", title: "Lectura", done: false }
  ]}
];

export const notesSeed: Note[] = [
  { id: "ideas", title: "Ideas 💡", body: "Crear contenido para redes\n- Videos\n- Posts", color: "yellow", createdAt: "2026-04-30" },
  { id: "reminder", title: "Recordatorio", body: "No olvidar la reunión de mañana\n10:00 am", color: "pink", createdAt: "2026-04-30" },
  { id: "goals", title: "Metas 🎯", body: "- Leer 12 libros este año\n- Correr 5k", color: "green", createdAt: "2026-04-30" },
  { id: "mood", title: "Motivación ✨", body: "Pequeños pasos, grandes cambios.", color: "blue", createdAt: "2026-04-30" },
  { id: "todo", title: "Tareas pendientes", body: "☑ Enviar proyecto\n☑ Estudiar capítulo 4\n☐ Comprar regalo", color: "purple", createdAt: "2026-04-30" }
];

export const remindersSeed: Reminder[] = [
  { id: "water", title: "Beber agua", time: "08:00", repeat: "daily", enabled: true },
  { id: "study", title: "Estudiar", time: "10:00", repeat: "daily", enabled: true },
  { id: "meditate", title: "Meditar", time: "18:00", repeat: "weekly", enabled: true },
  { id: "sleep", title: "Dormir", time: "22:30", repeat: "daily", enabled: false }
];

export const calendarSeed = [
  { id: "ev-1", time: "06:00", title: "😊 Ejercicio", color: "yellow" },
  { id: "ev-2", time: "08:00", title: "🏃‍♂️ Estudiar", color: "blue" },
  { id: "ev-3", time: "12:00", title: "🌱 Clases", color: "green" },
  { id: "ev-4", time: "14:00", title: "🍽️ Almuerzo", color: "pink" },
  { id: "ev-5", time: "16:00", title: "📘 Proyecto", color: "purple" },
  { id: "ev-6", time: "18:00", title: "🌙 Descanso", color: "blue" }
];
