'use client';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Toast = { id: number; message: string; action?: { label: string; onClick: () => void } };
const Ctx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    clearTimeout(timer.current);
    const id = Date.now();
    setToast({ ...t, id });
    timer.current = setTimeout(() => setToast((cur) => (cur?.id === id ? null : cur)), 5000);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
        {toast ? (
          <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-paper py-2.5 pl-5 pr-2.5 text-ink shadow-2xl">
            <span className="text-[15px]">{toast.message}</span>
            {toast.action ? (
              <button type="button" className="h-10 rounded-xl bg-ink px-4 text-sm font-bold text-paper"
                onClick={() => { toast.action!.onClick(); setToast(null); }}>{toast.action.label}</button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
