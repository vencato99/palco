'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type TourStop = {
  venueId: string; slug: string; name: string; city: string; state: string; capacity: number;
  lat?: number | null; lng?: number | null; date?: string;
};
type Ctx = {
  name: string; stops: TourStop[]; setName: (n: string) => void;
  has: (id: string) => boolean; toggle: (s: TourStop) => void; remove: (id: string) => void;
  setDate: (id: string, date: string) => void; move: (id: string, dir: -1 | 1) => void; clear: () => void;
};

const TourCtx = createContext<Ctx | null>(null);
const KEY = 'palco:tour';

/** Rascunho da turnê no navegador — funciona sem login; salvar na conta é opcional. */
export function TourProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState('Minha turnê');
  const [stops, setStops] = useState<TourStop[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); setName(d.name ?? 'Minha turnê'); setStops(d.stops ?? []); }
    } catch { /* storage indisponível: segue só em memória */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify({ name, stops })); } catch { /* ignore */ }
  }, [name, stops, ready]);

  const has = useCallback((id: string) => stops.some((s) => s.venueId === id), [stops]);
  const toggle = useCallback((s: TourStop) => setStops((cur) => (cur.some((x) => x.venueId === s.venueId) ? cur.filter((x) => x.venueId !== s.venueId) : [...cur, s])), []);
  const remove = useCallback((id: string) => setStops((cur) => cur.filter((x) => x.venueId !== id)), []);
  const setDate = useCallback((id: string, date: string) => setStops((cur) => cur.map((x) => (x.venueId === id ? { ...x, date } : x))), []);
  const move = useCallback((id: string, dir: -1 | 1) => setStops((cur) => {
    const i = cur.findIndex((x) => x.venueId === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= cur.length) return cur;
    const next = cur.slice(); [next[i], next[j]] = [next[j]!, next[i]!]; return next;
  }), []);
  const clear = useCallback(() => setStops([]), []);

  const value = useMemo(() => ({ name, stops, setName, has, toggle, remove, setDate, move, clear }), [name, stops, has, toggle, remove, setDate, move, clear]);
  return <TourCtx.Provider value={value}>{children}</TourCtx.Provider>;
}

export function useTour() {
  const ctx = useContext(TourCtx);
  if (!ctx) throw new Error('useTour precisa estar dentro de <TourProvider>');
  return ctx;
}

/** Distância em linha reta (km) — estimativa; a rodoviária costuma ser ~25% maior. */
export function haversineKm(a: TourStop, b: TourStop) {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.25);
}
