import type { ZodError } from 'zod';

/** Converte erros do Zod em { campo: mensagem }. Sem dependências de servidor: usado também no cliente. */
export function zodFields(err: ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
