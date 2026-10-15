import { ButtonLink } from '@/components/ui';

export const metadata = { title: 'Sobre' };

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Sobre o Palco</h1>
      <p className="text-lg leading-relaxed text-paper/90">O Palco reúne casas de show, teatros, auditórios e espaços para alugar em todo o Brasil. Cada local tem ficha técnica, comodidades, shows já realizados, contatos e avaliações de produtores que trabalharam lá.</p>
      <p className="text-lg leading-relaxed text-paper/90">Para quem produz, a busca entende pedidos como “teatro para mais de 1000 pessoas no Sul” e organiza os resultados por cidade, para montar uma turnê e consultar datas de uma vez.</p>
      <div className="flex flex-wrap gap-3"><ButtonLink href="/buscar">Montar turnê</ButtonLink><ButtonLink href="/cadastro" variant="secondary">Cadastrar meu espaço</ButtonLink></div>
    </div>
  );
}
