import type { SeatingFormat, VenueStatus, VenueType } from '@prisma/client';

export const VENUE_TYPES: Record<VenueType, string> = {
  THEATER: 'Teatro',
  CONCERT_HALL: 'Casa de show',
  AUDITORIUM: 'Auditório',
  MULTIPURPOSE: 'Espaço multiuso',
  ARENA: 'Arena',
  CONVENTION_CENTER: 'Centro de convenções',
};

export const SEATING_FORMATS: Record<SeatingFormat, string> = {
  SEATED: 'Sentado',
  STANDING: 'De pé',
  HYBRID: 'Híbrido',
};

export const VENUE_STATUS: Record<VenueStatus, { label: string; tone: 'ok' | 'warn' | 'mute' | 'danger' }> = {
  PUBLISHED: { label: 'Publicado', tone: 'ok' },
  PENDING: { label: 'Em análise', tone: 'warn' },
  DRAFT: { label: 'Rascunho', tone: 'mute' },
  REJECTED: { label: 'Recusado', tone: 'danger' },
};

/** Catálogo de comodidades. `key` é estável e usada em URL e banco. */
export const AMENITIES = [
  { key: 'bar', label: 'Bar', icon: 'bar' },
  { key: 'cadeiras', label: 'Cadeiras / poltronas', icon: 'chair' },
  { key: 'som', label: 'Sistema de som', icon: 'sound' },
  { key: 'luz', label: 'Iluminação cênica', icon: 'light' },
  { key: 'palco', label: 'Palco fixo', icon: 'stage' },
  { key: 'estacionamento', label: 'Estacionamento', icon: 'parking' },
  { key: 'acessibilidade', label: 'Acessibilidade', icon: 'access' },
  { key: 'ar', label: 'Ar-condicionado', icon: 'air' },
  { key: 'carga', label: 'Carga e descarga', icon: 'truck' },
  { key: 'gerador', label: 'Gerador próprio', icon: 'power' },
  { key: 'wifi', label: 'Wi-Fi para produção', icon: 'wifi' },
  { key: 'bilheteria-local', label: 'Bilheteria no local', icon: 'ticket' },
] as const;
export type AmenityKey = (typeof AMENITIES)[number]['key'];
export const AMENITY_KEYS = AMENITIES.map((a) => a.key) as unknown as [AmenityKey, ...AmenityKey[]];

export type Region = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export const STATES: Record<string, { name: string; region: Region }> = {
  AC: { name: 'Acre', region: 'norte' }, AL: { name: 'Alagoas', region: 'nordeste' },
  AP: { name: 'Amapá', region: 'norte' }, AM: { name: 'Amazonas', region: 'norte' },
  BA: { name: 'Bahia', region: 'nordeste' }, CE: { name: 'Ceará', region: 'nordeste' },
  DF: { name: 'Distrito Federal', region: 'centro-oeste' }, ES: { name: 'Espírito Santo', region: 'sudeste' },
  GO: { name: 'Goiás', region: 'centro-oeste' }, MA: { name: 'Maranhão', region: 'nordeste' },
  MT: { name: 'Mato Grosso', region: 'centro-oeste' }, MS: { name: 'Mato Grosso do Sul', region: 'centro-oeste' },
  MG: { name: 'Minas Gerais', region: 'sudeste' }, PA: { name: 'Pará', region: 'norte' },
  PB: { name: 'Paraíba', region: 'nordeste' }, PR: { name: 'Paraná', region: 'sul' },
  PE: { name: 'Pernambuco', region: 'nordeste' }, PI: { name: 'Piauí', region: 'nordeste' },
  RJ: { name: 'Rio de Janeiro', region: 'sudeste' }, RN: { name: 'Rio Grande do Norte', region: 'nordeste' },
  RS: { name: 'Rio Grande do Sul', region: 'sul' }, RO: { name: 'Rondônia', region: 'norte' },
  RR: { name: 'Roraima', region: 'norte' }, SC: { name: 'Santa Catarina', region: 'sul' },
  SP: { name: 'São Paulo', region: 'sudeste' }, SE: { name: 'Sergipe', region: 'nordeste' },
  TO: { name: 'Tocantins', region: 'norte' },
};
export const UFS = Object.keys(STATES).sort();

/** Ordem geográfica aproximada sul → norte, usada para sugerir a rota da turnê. */
export const ROUTE_ORDER = ['RS', 'SC', 'PR', 'SP', 'MS', 'RJ', 'MG', 'ES', 'GO', 'DF', 'MT', 'BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA', 'TO', 'PA', 'AP', 'AM', 'RO', 'AC', 'RR'];

/** Slugs proibidos para locais, pois colidem com rotas da aplicação. */
export const RESERVED_SLUGS = new Set(['admin', 'api', 'buscar', 'cadastro', 'entrar', 'locais', 'minha-conta', 'sobre', 'sugerir', 'turnes', 'uploads', '_next']);

export const PAGE_SIZE = 24;
export const SESSION_COOKIE = 'palco_session';
