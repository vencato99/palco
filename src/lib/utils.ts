import clsx, { type ClassValue } from 'clsx';

export const cn = (...v: ClassValue[]) => clsx(v);

/** Remove acentos e baixa a caixa — usado em busca e slugs. */
export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const slugify = (s: string) =>
  normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export const formatNumber = (n: number) => n.toLocaleString('pt-BR');

export const formatBRL = (cents?: number | null) =>
  cents == null
    ? null
    : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const formatMonthYear = (d: Date | string) =>
  new Date(d).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

export const formatRating = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
