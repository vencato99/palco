'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Barra de progresso no topo durante a navegação.
 * Aparece no clique de qualquer link interno e some quando a nova URL renderiza.
 * Também pode ser disparada por código: window.dispatchEvent(new Event('palco:navstart')).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const start = () => { clearTimeout(timer.current); setState('loading'); };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      start();
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('palco:navstart', start);
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('palco:navstart', start); };
  }, []);

  // A URL mudou: a página nova chegou.
  useEffect(() => {
    setState((s) => (s === 'loading' ? 'done' : s));
    timer.current = setTimeout(() => setState('idle'), 350);
    return () => clearTimeout(timer.current);
  }, [pathname, params]);

  if (state === 'idle') return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className={state === 'loading' ? 'h-full w-full origin-left animate-[navprogress_8s_cubic-bezier(.1,.7,.2,1)_forwards] bg-stage' : 'h-full w-full bg-stage opacity-0 transition-opacity duration-300'} />
    </div>
  );
}
