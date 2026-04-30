import type { CalendarEvent, Note, Reminder, TimeBlock } from "@/types";

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

export const calendarSeed: CalendarEvent[] = [
  { id: "ev-1", date: "2026-05-14", time: "06:00", title: "😊 Ejercicio", color: "yellow" },
  { id: "ev-2", date: "2026-05-14", time: "08:00", title: "🏃‍♂️ Estudiar", color: "blue" },
  { id: "ev-3", date: "2026-05-14", time: "12:00", title: "🌱 Clases", color: "green" },
  { id: "ev-4", date: "2026-05-14", time: "14:00", title: "🍽️ Almuerzo", color: "pink" },
  { id: "ev-5", date: "2026-05-14", time: "16:00", title: "📘 Proyecto", color: "purple" },
  { id: "ev-6", date: "2026-05-15", time: "18:00", title: "🌙 Descanso", color: "blue" }
];


export const walletSeed = {
  period: "weekly" as const,
  balance: 420,
  income: 1200,
  expenses: 670,
  savings: 530,
  budgetLimit: 1200,
  tip: "Has gastado un 20% más en entretenimiento esta semana. ¿Qué tal si intentás reducirlo un poco para ahorrar más?",
  categories: [
    { id: "food", name: "Comida", amount: 220, percent: 33, color: "orange" as const, icon: "🍕" },
    { id: "transport", name: "Transporte", amount: 120, percent: 18, color: "yellow" as const, icon: "🚌" },
    { id: "fun", name: "Entretenimiento", amount: 180, percent: 27, color: "purple" as const, icon: "🎮" },
    { id: "shopping", name: "Compras", amount: 150, percent: 22, color: "pink" as const, icon: "🛍️" }
  ],
  goals: [
    { id: "iphone", title: "iPhone 15", target: 900, current: 530, icon: "📱" }
  ],
  transactions: [
    { id: "tx-1", type: "income" as const, title: "Mesada", amount: 1200, category: "Mesada", date: "2026-05-14", period: "weekly" as const, color: "green" as const, icon: "💵" },
    { id: "tx-2", type: "expense" as const, title: "Almuerzo", amount: 220, category: "Comida", date: "2026-05-14", period: "weekly" as const, color: "orange" as const, icon: "🍕" },
    { id: "tx-3", type: "expense" as const, title: "Transporte", amount: 120, category: "Transporte", date: "2026-05-14", period: "weekly" as const, color: "yellow" as const, icon: "🚌" },
    { id: "tx-4", type: "saving" as const, title: "Ahorro meta", amount: 530, category: "iPhone 15", date: "2026-05-14", period: "weekly" as const, color: "purple" as const, icon: "📱" }
  ],
  badges: [
    { id: "badge-saving", label: "Buen ahorro", tone: "success" as const, icon: "🌱" },
    { id: "badge-budget", label: "Presupuesto sano", tone: "info" as const, icon: "🛡️" }
  ]
};
