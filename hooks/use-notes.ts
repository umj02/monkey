import { useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { notesSeed } from "@/lib/mock-data";
import { filterNotes } from "@/lib/services/note-service";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Note } from "@/types";

export function useNotes() {
  const [notes, setNotes, ready] = useLocalStorageState<Note[]>(STORAGE_KEYS.notes, notesSeed);
  const [query, setQuery] = useState("");
  const filteredNotes = useMemo(() => filterNotes(notes, query), [notes, query]);
  return { notes, setNotes, ready, query, setQuery, filteredNotes };
}
