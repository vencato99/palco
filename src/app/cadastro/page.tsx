import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '@/components/layout/AuthShell';
import { RegisterForm } from '@/components/forms/AuthForms';

export const metadata: Metadata = { title: 'Criar conta' };

export default function RegisterPage() {
  return (
    <AuthShell wide title="Faça parte do mapa de palcos do Brasil." text="Produtores encontram e avaliam locais. Casas e teatros recebem pedidos de pauta direto.">
      <Suspense><RegisterForm /></Suspense>
    </AuthShell>
  );
}
