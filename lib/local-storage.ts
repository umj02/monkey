import { Dispatch, SetStateAction, useEffect, useState } from "react";

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
  }, [key, ready, value]);

  return [value, setValue as Dispatch<SetStateAction<T>>, ready] as const;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
