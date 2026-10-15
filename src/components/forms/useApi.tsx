'use client';
import { useCallback, useState } from 'react';

type Result<T> = { ok: true; data: T } | { ok: false; error: string; fields: Record<string, string> };

/** Chamada JSON padronizada: loading, erro geral e erros por campo vindos do Zod no servidor. */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const call = useCallback(async <T = unknown>(url: string, method: string, body?: unknown): Promise<Result<T>> => {
    setLoading(true); setError(null); setFields({});
    try {
      const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Algo deu errado.'); setFields(data.fields ?? {});
        return { ok: false, error: data.error, fields: data.fields ?? {} };
      }
      return { ok: true, data };
    } catch {
      setError('Sem conexão. Verifique a internet e tente de novo.');
      return { ok: false, error: 'network', fields: {} };
    } finally { setLoading(false); }
  }, []);

  return { call, loading, error, fields, setFields };
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <div role="alert" className="rounded-xl border border-stage/40 bg-stage-soft px-4 py-3 text-sm">{message}</div>;
}
