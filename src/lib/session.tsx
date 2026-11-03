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

export type Profile = { name: string; from: string; intro: string };
export const defaultProfile: Profile = { name: trip.traveller, from: trip.traveller_from, intro: '' };
