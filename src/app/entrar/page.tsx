import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import { AuthShell } from '@/components/layout/AuthShell';
import { LoginForm } from '@/components/forms/AuthForms';

export const metadata: Metadata = { title: 'Entrar' };

export default async function LoginPage({ searchParams }: { searchParams: { senha?: string } }) {
  if (await getSession()) redirect('/minha-conta/locais');
  return (
    <AuthShell title="Entrar" text="Acesse suas turnês, seus locais e as consultas de pauta.">
      {searchParams.senha === 'ok' ? <p role="status" className="mb-4 rounded-xl bg-ok/15 px-4 py-3 text-sm text-ok">Senha atualizada. Entre com a nova senha.</p> : null}
      <Suspense><LoginForm /></Suspense>
    </AuthShell>
  );
}
