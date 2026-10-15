/**
 * Teste ponta a ponta contra um servidor rodando (npm run dev / start + seed).
 * Uso: BASE_URL=http://localhost:3000 node scripts/e2e.mjs
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '✔' : '✘'} ${name}${!cond && extra ? ` → ${extra}` : ''}`); };

class Client {
  cookie = '';
  async req(path, { method = 'GET', body, form, redirect = 'manual' } = {}) {
    const headers = this.cookie ? { cookie: this.cookie } : {};
    if (body) headers['content-type'] = 'application/json';
    const res = await fetch(BASE + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined), redirect });
    const set = res.headers.get('set-cookie');
    if (set) this.cookie = set.split(';')[0];
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = null; }
    return { status: res.status, json, text, location: res.headers.get('location') };
  }
}

const anon = new Client();
const owner = new Client();
const producer = new Client();
const admin = new Client();
const fresh = new Client();
const email = `teste${Date.now()}@palco.dev`;

console.log('\n— Páginas públicas');
for (const p of ['/', '/locais', '/locais?tipo=THEATER&min=1000&uf=PR,SP', '/buscar?q=teatro+para+mais+de+1000+pessoas+no+sul', '/teatro-araucaria-curitiba', '/sugerir', '/entrar', '/cadastro', '/sitemap.xml', '/robots.txt']) {
  const r = await anon.req(p);
  check(`GET ${p} → 200`, r.status === 200, r.status);
}
check('slug inexistente → 404', (await anon.req('/nao-existe-esse-local')).status === 404);
const prot = await anon.req('/minha-conta/locais');
check('área logada sem sessão redireciona para /entrar', prot.status === 307 && prot.location?.includes('/entrar'), `${prot.status} ${prot.location}`);

console.log('\n— Busca inteligente');
const s = await anon.req('/api/search?q=' + encodeURIComponent('teatro para mais de 1000 pessoas no Sul e Sudeste'));
check('entende tipo + capacidade + regiões', JSON.stringify(s.json?.chips) === JSON.stringify(['Teatro', 'Acima de 1.000 pessoas', 'Região: Sudeste + Sul']), JSON.stringify(s.json?.chips));
check('agrupa por cidade em ordem sul → norte', s.json?.groups?.[0]?.state === 'RS' && s.json.groups.at(-1).state === 'SP', s.json?.groups?.map((g) => g.state).join(','));
check('todos os resultados têm 1000+ lugares', s.json?.groups.every((g) => g.venues.every((v) => v.capacity >= 1000 && v.type === 'THEATER')));
const s2 = await anon.req('/api/search?q=' + encodeURIComponent('casa de show de pé até 1000 pessoas na Bahia'));
check('"de pé" + "até" + estado por nome', s2.json?.filters?.format === 'STANDING' && s2.json?.filters?.capMax === 1000 && s2.json?.filters?.states?.includes('BA'), JSON.stringify(s2.json?.filters));

console.log('\n— Filtros e paginação');
const f = await anon.req('/api/venues?com=bar,estacionamento&min=1000');
check('filtro por comodidades exige todas', f.json?.items?.length > 0 && f.json.items.every((v) => v.capacity >= 1000), f.status);
const pg1 = await anon.req('/api/venues?ordem=capacity');
check('ordenação por capacidade decrescente', pg1.json?.items?.[0]?.capacity >= pg1.json?.items?.at(-1)?.capacity);
const bad = await anon.req('/api/venues?min=abc&tipo=XYZ');
check('filtro inválido é ignorado (não quebra)', bad.status === 200);

console.log('\n— Cadastro e login');
let r = await fresh.req('/api/auth/register', { method: 'POST', body: { name: 'Teste', email, password: 'fraca', role: 'VENUE_OWNER' } });
check('senha fraca → 422 com erro no campo', r.status === 422 && !!r.json?.fields?.password, r.status);
r = await fresh.req('/api/auth/register', { method: 'POST', body: { name: 'Teste Silva', email, password: 'Segura123', role: 'VENUE_OWNER' } });
check('cadastro → 201 + cookie de sessão', r.status === 201 && fresh.cookie.startsWith('palco_session='), r.status);
r = await fresh.req('/api/auth/register', { method: 'POST', body: { name: 'Outra', email, password: 'Segura123' } });
check('e-mail duplicado → 409', r.status === 409);
r = await anon.req('/api/auth/login', { method: 'POST', body: { email: 'casa@palco.dev', password: 'errada' } });
check('senha errada → 401 com mensagem genérica', r.status === 401 && r.json?.error === 'E-mail ou senha incorretos.');
for (const [c, e] of [[owner, 'casa@palco.dev'], [producer, 'produtor1@palco.dev'], [admin, 'admin@palco.dev']]) {
  r = await c.req('/api/auth/login', { method: 'POST', body: { email: e, password: 'Palco1234' } });
  check(`login ${e}`, r.status === 200, r.status);
}
check('/api/auth/me retorna o usuário', (await owner.req('/api/auth/me')).json?.user?.role === 'VENUE_OWNER');
check('/admin bloqueado para não-admin', (await owner.req('/admin')).status === 307);
check('/admin liberado para admin', (await admin.req('/admin')).status === 200);

console.log('\n— Cadastrar, editar, salvar, excluir');
const venue = {
  intent: 'draft', name: 'Sala Teste E2E', type: 'MULTIPURPOSE', state: 'PR', city: 'Curitiba', address: null, description: 'Teste',
  capacity: '450', seatingFormat: 'HYBRID', acceptsRental: true, acceptsBoxOffice: false, rentalPriceCents: 500000, boxOfficePercent: null,
  dressingRooms: 2, parkingSpots: 0, stageWidth: null, stageDepth: null, stageHeight: null, amenities: ['bar', 'som'], techSpecs: {},
  photos: [], coverIndex: 0, contactName: null, contactEmail: '', contactPhone: null, whatsapp: null, website: null, instagram: null,
};
r = await owner.req('/api/venues', { method: 'POST', body: { ...venue, name: '', acceptsRental: false } });
check('validação: nome e modelo obrigatórios', r.status === 422 && r.json?.fields?.name && r.json?.fields?.acceptsRental, JSON.stringify(r.json?.fields));
r = await owner.req('/api/venues', { method: 'POST', body: venue });
const id = r.json?.id;
check('criar como rascunho → DRAFT', r.status === 201 && r.json?.status === 'DRAFT', `${r.status} ${r.json?.status}`);
check('rascunho não aparece no público', (await anon.req(`/${r.json?.slug}`)).status === 404);
r = await owner.req(`/api/venues/${id}`, { method: 'PATCH', body: { ...venue, intent: 'publish', capacity: '520', amenities: ['bar', 'som', 'luz'] } });
check('publicar (dono) → PENDING para análise', r.status === 200 && r.json?.status === 'PENDING', r.json?.status);
r = await owner.req(`/api/venues/${id}`);
check('edição salva capacidade e comodidades', r.json?.capacity === 520 && r.json?.amenities?.length === 3);
check('outro usuário não pode editar → 403', (await producer.req(`/api/venues/${id}`, { method: 'PATCH', body: venue })).status === 403);
check('sem login não pode criar → 401', (await anon.req('/api/venues', { method: 'POST', body: venue })).status === 401);
r = await owner.req(`/api/venues/${id}`, { method: 'DELETE' });
check('excluir → 200', r.status === 200);
check('excluído some da lista do dono', !(await owner.req('/minha-conta/locais')).text.includes('Sala Teste E2E'));
r = await owner.req(`/api/venues/${id}/restore`, { method: 'POST' });
check('desfazer exclusão → 200', r.status === 200);
check('restaurado volta para a lista', (await owner.req('/minha-conta/locais')).text.includes('Sala Teste E2E'));
const adminPub = await admin.req('/api/venues', { method: 'POST', body: { ...venue, name: 'Sala Admin E2E', intent: 'publish' } });
check('admin publica direto → PUBLISHED e visível', adminPub.json?.status === 'PUBLISHED' && (await anon.req(`/${adminPub.json.slug}`)).status === 200);
await admin.req(`/api/venues/${adminPub.json?.id}`, { method: 'DELETE' });

console.log('\n— Avaliações');
const list = await anon.req('/api/venues?ordem=recent');
const target = list.json.items.find((v) => v.slug !== 'teatro-araucaria-curitiba');
const review = { eventName: 'Show E2E', eventDate: '2026-09-01', overall: 4, technical: 4, service: 5, payment: 4, audience: 5, logistics: 4, comment: 'Ótima estrutura técnica e equipe atenciosa.' };
r = await producer.req(`/api/venues/${target.id}/reviews`, { method: 'POST', body: review });
check('produtor avalia → 201', r.status === 201, r.status);
check('mesma data de novo → 409', (await producer.req(`/api/venues/${target.id}/reviews`, { method: 'POST', body: review })).status === 409);
check('dono de local não avalia → 403', (await owner.req(`/api/venues/${target.id}/reviews`, { method: 'POST', body: review })).status === 403);
const after = (await anon.req('/api/venues?ordem=recent')).json.items.find((v) => v.id === target.id);
check('média e contagem atualizadas', after.ratingCount === target.ratingCount + 1, `${target.ratingCount} → ${after.ratingCount}`);

console.log('\n— Turnê e consulta de datas');
const ids = s.json.groups.flatMap((g) => g.venues.map((v) => v.id)).slice(0, 3);
r = await producer.req('/api/tours', { method: 'POST', body: { name: 'Turnê E2E', stops: ids.map((v, i) => ({ venueId: v, date: `2027-03-0${i + 1}` })) } });
check('salvar turnê → 201', r.status === 201);
check('turnê aparece em Minhas turnês', (await producer.req('/minha-conta/turnes')).text.includes('Turnê E2E'));
r = await producer.req('/api/availability', { method: 'POST', body: { venueIds: ids, date: '2027-03-01', eventType: 'Turnê' } });
check('consulta enviada para todos os locais', r.status === 201 && r.json?.sent === ids.length, JSON.stringify(r.json));
check('consulta sem login → 401', (await anon.req('/api/availability', { method: 'POST', body: { venueIds: ids, date: '2027-03-01', eventType: 'x' } })).status === 401);

console.log('\n— Sugestão → aprovação do admin');
r = await anon.req('/api/suggestions', { method: 'POST', body: { name: 'Teatro Sugerido E2E', type: 'THEATER', state: 'SC', city: 'Joinville', capacity: 1300, relation: 'KNOWS_IT', amenityKeys: ['som'] } });
check('visitante sugere local → 201', r.status === 201);
const sid = r.json?.id;
check('não-admin não decide → 403', (await owner.req(`/api/admin/suggestions/${sid}`, { method: 'PATCH', body: { action: 'approve' } })).status === 403);
r = await admin.req(`/api/admin/suggestions/${sid}`, { method: 'PATCH', body: { action: 'approve', overrides: { capacity: 1350 } } });
check('admin aprova → local publicado', r.status === 200 && !!r.json?.slug, r.status);
check('local aprovado já aparece na busca', (await anon.req('/api/search?q=teatro+em+SC')).text.includes('Teatro Sugerido E2E'));

console.log('\n— Recuperação de senha e logout');
check('esqueci a senha responde igual para e-mail inexistente', (await anon.req('/api/auth/forgot', { method: 'POST', body: { email: 'ninguem@x.com' } })).status === 200);
check('token inválido → 400', (await anon.req('/api/auth/reset', { method: 'POST', body: { token: 'x'.repeat(40), password: 'Nova12345' } })).status === 400);
await fresh.req('/api/auth/logout', { method: 'POST' });
check('logout encerra a sessão', (await fresh.req('/api/auth/me')).json?.user === null);

console.log(`\n${pass} passaram · ${fail} falharam`);
process.exit(fail ? 1 : 0);
