import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { trip } from '../content';

// In-memory store for the session: survives moving between screens, resets on reload.
const SessionContext = createContext<Map<string, unknown> | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new Map<string, unknown>());
  return <SessionContext.Provider value={store}>{children}</SessionContext.Provider>;
}

/** Like useState, but the value is kept for the session under `key`. */
export function useSessionState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const store = useContext(SessionContext);
  if (!store) throw new Error('useSessionState needs a SessionProvider');
  const [value, setValue] = useState<T>(() =>
    store.has(key) ? (store.get(key) as T) : typeof initial === 'function' ? (initial as () => T)() : initial,
  );
  useEffect(() => { store.set(key, value); }, [store, key, value]);
  return [value, setValue];
}

// Browser storage on the phone (localStorage). Every read and write is wrapped in try/catch:
// in private browsing, or with storage blocked or full, the app carries on and just doesn't remember.
const prefix = 'sweet-potato.';

function readSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(prefix + key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    // Ignore anything that isn't the expected shape, e.g. left over from an older version.
    if (typeof value !== typeof fallback || Array.isArray(value) !== Array.isArray(fallback) || value === null) return fallback;
    return (typeof fallback === 'object' && !Array.isArray(fallback) ? { ...fallback, ...value } : value) as T;
  } catch {
    return fallback;
  }
}

function writeSaved(key: string, value: unknown) {
  try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* not remembered, still works */ }
}

/** Like useSessionState, but also kept on the phone, so it survives refreshing and closing the app. */
export function useSavedState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useSessionState<T>('saved:' + key, () =>
    readSaved(key, typeof initial === 'function' ? (initial as () => T)() : initial),
  );
  useEffect(() => { writeSaved(key, value); }, [key, value]);
  return [value, setValue];
}

export type Profile = { name: string; from: string; intro: string };
export const defaultProfile: Profile = { name: trip.traveller, from: trip.traveller_from, intro: '' };
