"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { notesSeed } from "@/lib/mock-data";
import {
  createNote,
  filterNotes,
  type NoteInput,
} from "@/lib/services/note-service";
import {
  deleteNoteRemote,
  fetchNotes,
  upsertNote,
} from "@/lib/services/supabase-data-service";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/hooks/use-auth";
import type { Note } from "@/types";

export function useNotes() {
  const { session, mode } = useAuth();
  const [notes, setNotes, ready] = useLocalStorageState<Note[]>(
    STORAGE_KEYS.notes,
    notesSeed,
    [...LEGACY_STORAGE_KEYS.notes],
  );
  const [syncing, setSyncing] = useState(false);
  const [query, setQuery] = useState("");
  const filteredNotes = useMemo(
    () => filterNotes(notes, query),
    [notes, query],
  );

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    let cancelled = false;
    setSyncing(true);
    fetchNotes()
      .then((remote) => {
        if (!cancelled && remote) setNotes(remote);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode, setNotes]);

  function create(input: NoteInput) {
    const note = createNote(input);
    setNotes((list) => [note, ...list]);
    if (session && mode === "supabase") {
      void upsertNote(note).then((remote) => {
        if (!remote) return;
        setNotes((list) =>
          list.map((item) => (item.id === note.id ? remote : item)),
        );
      });
    }
  }

  function update(id: string, input: NoteInput) {
    const updated = notes.find((note) => note.id === id);
    const nextNote = updated
      ? {
          ...updated,
          title: input.title.trim(),
          body: input.body.trim(),
          color: input.color,
        }
      : null;
    setNotes((list) =>
      list.map((note) => (note.id === id && nextNote ? nextNote : note)),
    );
    if (nextNote && session && mode === "supabase") void upsertNote(nextNote);
  }

  function remove(id: string) {
    setNotes((list) => list.filter((note) => note.id !== id));
    if (session && mode === "supabase") void deleteNoteRemote(id);
  }

  return {
    notes,
    setNotes,
    ready,
    syncing,
    query,
    setQuery,
    filteredNotes,
    createNote: create,
    updateNote: update,
    deleteNote: remove,
  };
}
