/**
 * Dados de exemplo para desenvolvimento. Todos os locais, pessoas e shows são FICTÍCIOS.
 * Rode com: npm run db:seed
 */
import { PrismaClient, type SeatingFormat, type VenueType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AMENITIES } from '../src/lib/constants';
import { normalize, slugify } from '../src/lib/utils';

const prisma = new PrismaClient();

type SeedVenue = {
  name: string; type: VenueType; city: string; state: string; lat: number; lng: number; capacity: number;
  format: SeatingFormat; rental: boolean; box: boolean; price?: number; pct?: number; rooms: number; parking: number;
  amenities: string[]; featured?: boolean;
};

const VENUES: SeedVenue[] = [
  { name: 'Teatro Araucária', type: 'THEATER', city: 'Curitiba', state: 'PR', lat: -25.43, lng: -49.27, capacity: 2100, format: 'SEATED', rental: true, box: true, price: 18000, pct: 20, rooms: 6, parking: 320, amenities: ['bar', 'cadeiras', 'som', 'luz', 'palco', 'estacionamento', 'acessibilidade', 'ar', 'carga'], featured: true },
  { name: 'Teatro Ópera Verde', type: 'THEATER', city: 'Curitiba', state: 'PR', lat: -25.44, lng: -49.28, capacity: 1300, format: 'SEATED', rental: true, box: false, price: 9500, rooms: 4, parking: 0, amenities: ['cadeiras', 'som', 'luz', 'palco', 'acessibilidade'] },
  { name: 'Teatro do Cais', type: 'THEATER', city: 'Porto Alegre', state: 'RS', lat: -30.03, lng: -51.23, capacity: 1200, format: 'SEATED', rental: false, box: true, pct: 25, rooms: 5, parking: 80, amenities: ['bar', 'cadeiras', 'som', 'luz', 'palco', 'carga'] },
  { name: 'Teatro Ilha Centro', type: 'THEATER', city: 'Florianópolis', state: 'SC', lat: -27.59, lng: -48.55, capacity: 1100, format: 'SEATED', rental: true, box: false, price: 8000, rooms: 3, parking: 120, amenities: ['cadeiras', 'som', 'ar', 'estacionamento'] },
  { name: 'Teatro Jardim Paulista', type: 'THEATER', city: 'São Paulo', state: 'SP', lat: -23.57, lng: -46.66, capacity: 1050, format: 'SEATED', rental: true, box: false, price: 22000, rooms: 4, parking: 0, amenities: ['cadeiras', 'som', 'luz', 'carga', 'ar'] },
  { name: 'Teatro Avenida', type: 'THEATER', city: 'São Paulo', state: 'SP', lat: -23.56, lng: -46.65, capacity: 1600, format: 'SEATED', rental: false, box: true, pct: 22, rooms: 5, parking: 200, amenities: ['bar', 'cadeiras', 'som', 'luz', 'palco', 'estacionamento', 'acessibilidade'], featured: true },
  { name: 'Espaço Usina', type: 'CONCERT_HALL', city: 'Rio de Janeiro', state: 'RJ', lat: -22.91, lng: -43.2, capacity: 2800, format: 'HYBRID', rental: true, box: true, price: 30000, pct: 18, rooms: 3, parking: 150, amenities: ['bar', 'som', 'luz', 'estacionamento', 'gerador', 'carga'] },
  { name: 'Auditório Mirante', type: 'AUDITORIUM', city: 'Belo Horizonte', state: 'MG', lat: -19.92, lng: -43.94, capacity: 1450, format: 'SEATED', rental: true, box: false, price: 12000, rooms: 4, parking: 250, amenities: ['cadeiras', 'som', 'luz', 'acessibilidade', 'ar', 'estacionamento', 'wifi'] },
  { name: 'Centro de Convenções Litoral', type: 'CONVENTION_CENTER', city: 'Recife', state: 'PE', lat: -8.05, lng: -34.88, capacity: 1800, format: 'SEATED', rental: true, box: false, price: 15000, rooms: 3, parking: 600, amenities: ['cadeiras', 'som', 'ar', 'estacionamento', 'wifi', 'acessibilidade'] },
  { name: 'Galpão Ladeira', type: 'MULTIPURPOSE', city: 'Salvador', state: 'BA', lat: -12.97, lng: -38.5, capacity: 900, format: 'STANDING', rental: true, box: true, price: 7000, pct: 25, rooms: 2, parking: 0, amenities: ['bar', 'som', 'luz'] },
  { name: 'Arena Beira-Mar', type: 'ARENA', city: 'Fortaleza', state: 'CE', lat: -3.73, lng: -38.52, capacity: 6000, format: 'HYBRID', rental: true, box: true, price: 60000, pct: 15, rooms: 8, parking: 1200, amenities: ['bar', 'som', 'luz', 'palco', 'estacionamento', 'acessibilidade', 'gerador', 'carga', 'bilheteria-local'], featured: true },
];

async function main() {
  console.time('seed');
  await prisma.$transaction([
    prisma.availabilityRequest.deleteMany(), prisma.tourStop.deleteMany(), prisma.tour.deleteMany(),
    prisma.review.deleteMany(), prisma.venueSuggestion.deleteMany(), prisma.venue.deleteMany(), prisma.passwordReset.deleteMany(), prisma.user.deleteMany(),
  ]);

  for (const a of AMENITIES) await prisma.amenity.upsert({ where: { key: a.key }, update: { label: a.label, icon: a.icon }, create: a });
  const amen = Object.fromEntries((await prisma.amenity.findMany()).map((a) => [a.key, a.id]));

  const pass = await bcrypt.hash('Palco1234', 11);
  const admin = await prisma.user.create({ data: { name: 'Equipe Palco', email: 'admin@palco.dev', role: 'ADMIN', passwordHash: pass } });
  const owner = await prisma.user.create({ data: { name: 'Mariana Rocha', email: 'casa@palco.dev', role: 'VENUE_OWNER', company: 'Teatro Araucária', passwordHash: pass } });
  const producers = await Promise.all([
    ['Thiago Souza', 'TS Entretenimento'], ['Ana Lima', 'Cia. Margem'], ['Paulo Gaspar', 'Gaspar Eventos'],
  ].map(([name, company], i) => prisma.user.create({ data: { name: name!, company, email: `produtor${i + 1}@palco.dev`, role: 'PRODUCER', passwordHash: pass } })));

  const comments = [
    'Equipe técnica muito preparada e rider atendido por completo. A doca facilita a montagem.',
    'Acústica excelente e frente de casa organizada nas duas sessões.',
    'Ótimo para cenário grande. Estacionamento lota rápido em dias cheios.',
  ];

  for (const [i, v] of VENUES.entries()) {
    const venue = await prisma.venue.create({
      data: {
        slug: slugify(`${v.name}-${v.city}`), name: v.name, type: v.type, city: v.city, cityNormalized: normalize(v.city), state: v.state,
        latitude: v.lat, longitude: v.lng, capacity: v.capacity, seatingFormat: v.format, acceptsRental: v.rental, acceptsBoxOffice: v.box,
        rentalPriceCents: v.price ? v.price * 100 : null, boxOfficePercent: v.pct ?? null, dressingRooms: v.rooms, parkingSpots: v.parking,
        stageWidth: 12 + (i % 5), stageDepth: 10 + (i % 3), stageHeight: 8,
        description: `[Descrição do ${v.name}: história, perfil de programação e diferenciais.]`,
        techSpecs: { som: '[Marca/modelo] line array · mesa digital 48 canais', luz: '[Quantidade] moving heads', energia: 'Trifásica 380 V' },
        contactName: '[Responsável pela pauta]', contactEmail: `pauta+${i}@exemplo.com.br`, contactPhone: '(00) 0000-0000',
        status: 'PUBLISHED', verified: true, featured: !!v.featured, ownerId: i === 0 ? owner.id : null,
        amenities: { create: v.amenities.map((k) => ({ amenityId: amen[k]! })) },
        sections: v.format === 'SEATED' ? { create: [{ name: 'Plateia', capacity: Math.round(v.capacity * 0.6) }, { name: 'Balcão', capacity: Math.round(v.capacity * 0.4) }] } : undefined,
        shows: { create: [
          { title: 'Turnê “Noites de Jazz”', category: 'Show musical', date: new Date('2026-08-15'), audience: Math.round(v.capacity * 0.9) },
          { title: 'Cia. Margem — “O Farol”', category: 'Teatro', date: new Date('2026-07-10'), audience: v.capacity, soldOut: true },
        ] },
        showsCount: 2,
      },
    });
    const reviews = producers.slice(0, 1 + (i % 3)).map((p, j) => ({
      venueId: venue.id, authorId: p.id, eventName: 'Show musical', eventDate: new Date(`2026-0${(j % 8) + 1}-10`),
      overall: 5 - (j % 2), technical: 5, service: 5 - (j % 2), payment: 4 + (i % 2), audience: 5, logistics: 4, comment: comments[j % 3]!,
    }));
    await prisma.review.createMany({ data: reviews });
    const avg = reviews.reduce((s, r) => s + r.overall, 0) / reviews.length;
    await prisma.venue.update({ where: { id: venue.id }, data: { ratingAvg: avg, ratingCount: reviews.length } });
  }

  await prisma.venueSuggestion.createMany({ data: [
    { name: 'Cine Teatro Vale Verde', type: 'THEATER', city: 'Londrina', state: 'PR', capacity: 900, relation: 'PRODUCED_THERE', submittedById: producers[0]!.id, amenityKeys: ['som', 'cadeiras'] },
    { name: 'Galpão 22', type: 'CONCERT_HALL', city: 'Goiânia', state: 'GO', capacity: 1500, relation: 'MANAGER', amenityKeys: ['bar', 'som', 'luz'] },
    { name: 'Auditório Beira-Rio', type: 'AUDITORIUM', city: 'Manaus', state: 'AM', relation: 'KNOWS_IT', amenityKeys: [] },
  ] });

  console.timeEnd('seed');
  console.log('Contas (senha Palco1234): admin@palco.dev · casa@palco.dev · produtor1@palco.dev');
  void admin;
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
