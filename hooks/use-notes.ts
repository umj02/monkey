"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { notesSeed } from "@/lib/mock-data";
import { createNote, filterNotes, type NoteInput } from "@/lib/services/note-service";
import { deleteNoteRemote, fetchNotes, upsertNote } from "@/lib/services/supabase-data-service";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/hooks/use-auth";
import type { Note } from "@/types";

export function useNotes() {
  const { session, mode } = useAuth();
  const [notes, setNotes, ready] = useLocalStorageState<Note[]>(STORAGE_KEYS.notes, notesSeed, [...LEGACY_STORAGE_KEYS.notes]);
  const [syncing, setSyncing] = useState(false);
  const [query, setQuery] = useState("");
  const filteredNotes = useMemo(() => filterNotes(notes, query), [notes, query]);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    setSyncing(true);
    fetchNotes().then((remote) => {
      if (remote && remote.length) setNotes(remote);
      setSyncing(false);
    });
  }, [session?.userId, mode]);

  function create(input: NoteInput) {
    const note = createNote(input);
    setNotes((list) => [note, ...list]);
    if (session && mode === "supabase") void upsertNote(note);
  }

  function update(id: string, input: NoteInput) {
    let nextNote: Note | null = null;
    setNotes((list) => list.map((note) => {
      if (note.id !== id) return note;
      nextNote = { ...note, title: input.title.trim(), body: input.body.trim(), color: input.color };
      return nextNote;
    }));
    window.setTimeout(() => { if (nextNote && session && mode === "supabase") void upsertNote(nextNote); }, 0);
  }

  function remove(id: string) {
    setNotes((list) => list.filter((note) => note.id !== id));
    if (session && mode === "supabase") void deleteNoteRemote(id);
  }

  return { notes, setNotes, ready, syncing, query, setQuery, filteredNotes, createNote: create, updateNote: update, deleteNote: remove };
}
