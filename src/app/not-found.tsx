import { ButtonLink } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-extrabold">Página não encontrada</h1>
      <p className="text-mute">O local pode ter mudado de endereço ou saído do ar.</p>
      <ButtonLink href="/locais">Buscar locais</ButtonLink>
    </div>
  );
}
