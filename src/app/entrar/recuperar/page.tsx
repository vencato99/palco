import Link from 'next/link';
import { AuthShell } from '@/components/layout/AuthShell';
import { ForgotForm } from '@/components/forms/AuthForms';

export const metadata = { title: 'Recuperar senha' };

export default function ForgotPage() {
  return (
    <AuthShell title="Recuperar senha" text="Enviaremos um link para você criar uma nova senha.">
      <ForgotForm />
      <Link href="/entrar" className="mt-5 block text-center text-sm text-mute underline">Voltar ao login</Link>
    </AuthShell>
  );
}
