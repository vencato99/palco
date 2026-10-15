import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line pb-24 md:pb-0">
      <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo />
          <p className="text-sm text-mute">Casas de show, teatros, auditórios e espaços para alugar em todo o Brasil.</p>
        </div>
        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-mute">
          <Link href="/locais" className="hover:text-paper">Buscar locais</Link>
          <Link href="/buscar" className="hover:text-paper">Montar turnê</Link>
          <Link href="/sugerir" className="hover:text-paper">Sugerir um local</Link>
          <Link href="/cadastro" className="hover:text-paper">Cadastrar meu espaço</Link>
          <Link href="/termos" className="hover:text-paper">Termos de uso</Link>
          <Link href="/privacidade" className="hover:text-paper">Política de privacidade</Link>
        </nav>
      </div>
      <p className="mx-auto max-w-page px-4 pb-8 text-xs text-mute md:px-6">© {new Date().getFullYear()} Palco. Todos os direitos reservados.</p>
    </footer>
  );
}
