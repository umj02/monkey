import { useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { notesSeed } from "@/lib/mock-data";
import { createNote, filterNotes, type NoteInput } from "@/lib/services/note-service";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import type { Note } from "@/types";

export function useNotes() {
  const [notes, setNotes, ready] = useLocalStorageState<Note[]>(STORAGE_KEYS.notes, notesSeed, [...LEGACY_STORAGE_KEYS.notes]);
  const [query, setQuery] = useState("");
  const filteredNotes = useMemo(() => filterNotes(notes, query), [notes, query]);
  return {
    notes,
    setNotes,
    ready,
    query,
    setQuery,
    filteredNotes,
    createNote: (input: NoteInput) => setNotes((list) => [createNote(input), ...list]),
    updateNote: (id: string, input: NoteInput) => setNotes((list) => list.map((note) => note.id === id ? { ...note, title: input.title.trim(), body: input.body.trim(), color: input.color } : note)),
    deleteNote: (id: string) => setNotes((list) => list.filter((note) => note.id !== id))
  };
}
