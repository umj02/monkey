import { Dispatch, SetStateAction, useEffect, useState } from "react";

const LOCAL_STORAGE_SYNC_EVENT = "monkey:local-storage-sync";

function readStoredValue<T>(key: string, legacyKeys: string[], initialValue: T): T {
  try {
    const keys = [key, ...legacyKeys];
    for (const currentKey of keys) {
      const stored = window.localStorage.getItem(currentKey);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        if (currentKey !== key) window.localStorage.setItem(key, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch {
    return initialValue;
  }
  return initialValue;
}

export function useLocalStorageState<T>(key: string, initialValue: T, legacyKeys: string[] = []) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(readStoredValue(key, legacyKeys, initialValue));
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_SYNC_EVENT, { detail: { key } }));
  }, [key, ready, value]);

  useEffect(() => {
    if (!ready) return;
    const applyStoredValue = () => {
      const raw = window.localStorage.getItem(key);
      setValue((current) => {
        try {
          if (raw && JSON.stringify(current) === raw) return current;
        } catch {
          // Si no se puede comparar, refrescamos desde storage.
        }
        return readStoredValue(key, legacyKeys, initialValue);
      });
    };
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key !== key) return;
      applyStoredValue();
    };
    const storage = (event: StorageEvent) => {
      if (event.key !== key && !legacyKeys.includes(event.key ?? "")) return;
      applyStoredValue();
    };
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, sync);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, sync);
      window.removeEventListener("storage", storage);
    };
  }, [key, ready, legacyKeys, initialValue]);

  return [value, setValue as Dispatch<SetStateAction<T>>, ready] as const;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
