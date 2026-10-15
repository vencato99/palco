import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { ButtonLink } from '@/components/ui';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { UserMenu } from './UserMenu';

/** Server component: a sessão é lida no servidor, sem flash de "Entrar" para quem já está logado. */
export async function Header() {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <NavLinks />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sugerir" className="hidden h-10 items-center rounded-xl px-3 text-sm font-semibold text-mute hover:text-paper lg:flex">Sugerir local</Link>
          {session ? (
            <UserMenu name={session.name} role={session.role} />
          ) : (
            <>
              <ButtonLink href="/entrar" variant="ghost" size="sm">Entrar</ButtonLink>
              <ButtonLink href="/cadastro" variant="light" size="sm" className="hidden sm:inline-flex">Criar conta</ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
