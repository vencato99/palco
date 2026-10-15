# Palco — plataforma de casas de show, teatros e espaços para alugar

Stack: **Next.js 14 (App Router) + Node.js**, **PostgreSQL + Prisma**, **TypeScript**, **Tailwind**, **Zod** e **JWT (jose)** em cookie httpOnly.
O frontend e o backend ficam no mesmo projeto. As rotas `/api/*` rodam no runtime Node.

## Como rodar

```bash
cp .env.example .env          # preencha DATABASE_URL e AUTH_SECRET
npm install
npm run db:migrate            # cria as tabelas (gera a migration inicial)
npm run db:seed               # dados de exemplo (fictícios)
npm run dev                   # http://localhost:3000
npm run test:e2e              # (outro terminal) 56 testes ponta a ponta
```

Contas do seed, todas com a senha `Palco1234`:

| Conta | Papel |
|---|---|
| `admin@palco.dev` | Admin |
| `casa@palco.dev` | Dono de local |
| `produtor1@palco.dev` | Produtor |

## Arquitetura

```
prisma/
  schema.prisma        modelos, enums e índices
  seed.ts              dados de exemplo
src/
  middleware.ts        protege /minha-conta e /admin (edge, verifica o JWT)
  lib/                 código compartilhado, sem regra de negócio
    constants.ts       tipos de local, comodidades, UFs/regiões, ordem de rota
    validators.ts      schemas Zod — os MESMOS no cliente e no servidor
    filters.ts         URL ⇄ filtros ⇄ WHERE do Prisma
    search-parser.ts   busca em linguagem natural → filtros
    session.ts         assinar/verificar JWT (edge-safe)
    auth.ts            sessão via cookie, requireUser(roles)
    http.ts            wrapper de rotas, erros padronizados, parseBody
  server/services/     regras de negócio + acesso ao banco (server-only)
    venue.service.ts   busca, perfil, CRUD, exclusão lógica, cache
    review.service.ts  avaliações + média desnormalizada
    suggestion.service.ts  sugestões e aprovação pelo admin
    tour.service.ts    turnês salvas
    availability.service.ts  consultas de data (uma ou várias)
    auth.service.ts    cadastro, login, recuperação de senha
  app/                 páginas (server components) e rotas /api
  components/
    ui/                kit base: Button, Field, Chip, Modal, Toast, Stepper…
    layout/            Header, NavLinks, UserMenu, MobileNav, Footer
    venue/             cards, filtros, galeria, ficha técnica, reviews
    tour/              busca inteligente, painel da turnê, contexto
    forms/             auth, sugestão e formulário de local em 5 etapas
    home/ account/ admin/
```

O fluxo de dados segue sempre o mesmo caminho:

- **Leitura:** a página é um server component e chama o **service** direto, sem passar por HTTP interno.
- **Escrita:** o client component chama `/api/...`, a rota valida o corpo com **Zod**, aplica as permissões e chama o **service**. Por fim, o cache é invalidado por tag.

## Rotas

**Páginas públicas**

| Rota | Tela |
|---|---|
| `/` | Home |
| `/locais` | Lista com filtros |
| `/buscar?q=…` | Busca inteligente agrupada por cidade, para montar turnê |
| `/{slug}` | Perfil do local (URL curta, como na referência) |
| `/sugerir` | Sugerir um local |
| `/entrar`, `/cadastro`, `/entrar/recuperar`, `/entrar/nova-senha` | Conta |

**Páginas logadas**

| Rota | Tela |
|---|---|
| `/minha-conta/locais` | Lista dos meus locais |
| `/minha-conta/locais/novo` | Cadastrar local |
| `/minha-conta/locais/{id}/editar` | Editar local |
| `/minha-conta/turnes` | Turnês salvas |

**Admin:** `/admin` e `/admin/sugestoes/{id}`.

**API**

| Método | Rota | Função |
|---|---|---|
| POST | `/api/auth/{login,register,logout,forgot,reset}` | Conta |
| GET | `/api/auth/me` | Sessão atual |
| GET / POST | `/api/venues` | Busca paginada / criar local |
| GET / PATCH / DELETE | `/api/venues/:id` | Ler, editar, excluir |
| POST | `/api/venues/:id/restore` | Desfazer exclusão |
| GET / POST | `/api/venues/:id/reviews` | Listar / avaliar |
| GET | `/api/search?q=` | Filtros entendidos + locais por cidade |
| POST | `/api/availability` | Consulta de data para 1 ou N locais |
| POST | `/api/suggestions` | Enviar sugestão |
| PATCH | `/api/admin/suggestions/:id` | Aprovar, pedir dados ou rejeitar |
| GET / POST / PUT / DELETE | `/api/tours` | Turnês |
| POST | `/api/uploads` | Fotos |

## Regras de negócio

**Publicação de locais**
- Quando o dono clica em "Salvar e publicar", o local vai para `PENDING`, ou seja, fica em análise.
- O admin publica direto.
- Um local que já está publicado continua publicado depois de ser editado.

**Exclusão**
- A exclusão é lógica: preenche `deletedAt`, sem apagar o registro.
- Isso permite o "Desfazer" e preserva avaliações e histórico de shows.

**Avaliações**
- Só produtores podem avaliar, e nunca o próprio local.
- Cada produtor faz no máximo uma avaliação por local por data.
- A média é recalculada na mesma transação em que a avaliação é salva.

**Sugestões**
- Quando um admin aprova uma sugestão, o local é criado já publicado e verificado.
- Se quem sugeriu disse ser o responsável pelo local, essa pessoa vira dona dele.

## Otimizações

**Banco**
- Índices compostos para os filtros mais comuns: status com capacidade, estado com cidade, tipo, dono e destaque.
- Média e contagem de avaliações ficam desnormalizadas, para ordenar a lista sem JOIN.
- A cidade é guardada também em formato normalizado (sem acento), o que torna a busca rápida e indexável.

**Consultas**
- O `select` dos cards traz só os campos necessários, sem descrição nem ficha técnica.
- A paginação é por cursor, em vez de `OFFSET`.
- Consultas independentes rodam em paralelo com `Promise.all`.
- Contagem e lista vêm juntas em `$transaction`.

**Cache**
- `unstable_cache` com tags (`venues`, `venue:{slug}`) nas listagens públicas e nos perfis.
- `revalidateTag` limpa só o que mudou depois de cada escrita.

**Frontend**
- Server components por padrão; JavaScript no cliente só onde há interação.
- O modal de filtros é carregado sob demanda com `next/dynamic`.
- Fontes com `next/font` (sem layout shift) e imagens com `next/image` (AVIF/WebP e `sizes` corretos).
- Os filtros vivem na URL: dá para compartilhar o link, o botão voltar funciona e não há estado duplicado.
- A busca por cidade tem debounce e a exclusão é otimista (`useOptimistic`).

**Segurança**
- Senhas com bcrypt e JWT em cookie httpOnly com `sameSite=lax`.
- O middleware protege as rotas na edge, e as rotas da API checam as permissões de novo.
- Login e recuperação de senha dão a mesma resposta para qualquer e-mail, sem revelar quais contas existem.
- Uploads validam tipo e tamanho do arquivo.
- O redirecionamento depois do login só aceita caminhos internos.

## Fotos

- **Onde subir no sistema:**
  - Cadastro e edição de local: *Minha conta → Meus locais → etapa 4, Fotos*. Dá para escolher a capa e remover.
  - Sugestão de local: */sugerir*, campo "Fotos do local", com até 10 fotos e só para quem está logado.
  - O admin vê as fotos da sugestão e, ao aprovar, elas viram as fotos do local.
- **Como funciona:** `POST /api/uploads` confere a assinatura real do arquivo (JPG, PNG, WEBP ou AVIF, até 8 MB) e grava no bucket com nome único (`venues/AAAA/MM/<uuid>.ext`).
- **Entrega:** `GET /api/files/<chave>` entrega a foto com cache de 1 ano, e o `next/image` gera as versões otimizadas.
- **Limpeza:** fotos removidas de um local são apagadas do bucket.
- **Configuração:** variáveis `S3_*` (ver `.env.example`). Sem elas, em desenvolvimento, as fotos ficam em `./.uploads`.

## Antes de ir para produção

- **E-mail:** a recuperação de senha imprime o link no terminal. Conecte um provedor (Resend, SES) em `auth.service.ts`.
- **Limite de tentativas:** adicione rate limit em `/api/auth/*` (por exemplo, Upstash Redis).
- **Busca:** para busca textual pesada, considere `pg_trgm` e um índice GIN em `name`.
- **Deploy:** Vercel, Railway ou Render, com o banco no Neon, Railway ou Supabase. Rode `npm run db:deploy` no deploy.
