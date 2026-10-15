'use client';
import { Button } from '@/components/ui';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold">Não foi possível carregar esta página</h1>
      <p className="text-mute">Verifique sua conexão e tente de novo.</p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  );
}
