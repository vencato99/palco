import type { Metadata } from 'next';
import { SuggestForm } from '@/components/forms/SuggestForm';

export const metadata: Metadata = { title: 'Sugerir um local' };

const STEPS = [
  ['Você envia', 'Dados básicos, comodidades e contato do local'],
  ['Nossa equipe verifica', 'Confirmamos as informações com a casa'],
  ['O local entra no ar', 'Com selo de verificado e aberto a avaliações'],
];

export default function SuggestPage() {
  return (
    <div className="mx-auto grid max-w-page gap-8 px-4 py-10 md:px-6 lg:grid-cols-[360px_1fr]">
      <aside className="flex flex-col gap-6 self-start rounded-3xl bg-stage p-7 text-white">
        <h1 className="font-display text-4xl font-extrabold leading-tight">Sugira um local que ainda não está aqui.</h1>
        <ol className="flex flex-col gap-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-bold text-stage-dark">{i + 1}</span>
              <span><strong className="block">{t}</strong><span className="text-sm text-white/85">{d}</span></span>
            </li>
          ))}
        </ol>
      </aside>
      <section className="rounded-3xl border border-line bg-ink-2 p-6 md:p-8"><SuggestForm /></section>
    </div>
  );
}
