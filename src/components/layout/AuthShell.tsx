import type { ReactNode } from 'react';

/** Moldura das telas de conta: texto à esquerda, cartão do formulário à direita (empilha no mobile). */
export function AuthShell({ title, text, children, wide }: { title: string; text: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="mx-auto grid max-w-page gap-10 px-4 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-6 md:py-20">
      <div className="flex max-w-md flex-col gap-4">
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{title}</h1>
        <p className="text-lg text-mute">{text}</p>
      </div>
      <div className={`w-full rounded-3xl border border-line bg-ink-2 p-6 md:p-8 ${wide ? 'md:w-[640px]' : 'md:w-[440px]'}`}>{children}</div>
    </div>
  );
}
