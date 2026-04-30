import { createId } from "@/lib/local-storage";
import type { Note } from "@/types";

export type NoteInput = Pick<Note, "title" | "body" | "color">;

export function createNote(input: NoteInput): Note {
  return { id: createId("note"), title: input.title.trim(), body: input.body.trim(), color: input.color, createdAt: new Date().toISOString() };
}

export function filterNotes(notes: Note[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return notes;
  return notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(normalized));
}
