import Link from 'next/link';
import { AuthShell } from '@/components/layout/AuthShell';
import { ResetForm } from '@/components/forms/AuthForms';

export const metadata = { title: 'Criar nova senha' };

export default function ResetPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <AuthShell title="Criar nova senha" text="Escolha uma senha que você não usa em outros sites.">
      {searchParams.token ? <ResetForm token={searchParams.token} /> : (
        <p>Link incompleto. <Link href="/entrar/recuperar" className="underline">Peça um novo link</Link>.</p>
      )}
    </AuthShell>
  );
}
