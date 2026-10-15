/**
 * Interpreta buscas em linguagem natural, como
 * "teatro para mais de 1000 pessoas no Sul e Sudeste".
 * Regras simples e determinísticas: rápidas, testáveis e sem custo de API.
 */
import type { SeatingFormat, VenueType } from '@prisma/client';
import { AMENITIES, STATES, type AmenityKey, type Region } from './constants';
import { normalize } from './utils';

export type ParsedQuery = {
  type?: VenueType;
  capMin?: number;
  capMax?: number;
  format?: SeatingFormat;
  model?: 'rental' | 'boxoffice';
  states?: string[];
  regions?: Region[];
  city?: string;
  amenities?: AmenityKey[];
  dressingMin?: number;
  /** Rótulos legíveis do que foi entendido, para mostrar como chips. */
  chips: string[];
};

const TYPE_WORDS: [RegExp, VenueType, string][] = [
  [/\bteatros?\b/, 'THEATER', 'Teatro'],
  [/\bcasas? de shows?\b|\bcasas? noturnas?\b|\bclubs?\b/, 'CONCERT_HALL', 'Casa de show'],
  [/\baudit[oó]rios?\b/, 'AUDITORIUM', 'Auditório'],
  [/\barenas?\b|\bginasios?\b|\bestadios?\b/, 'ARENA', 'Arena'],
  [/\bcentros? de convenc/, 'CONVENTION_CENTER', 'Centro de convenções'],
  [/\bmultiuso\b|\bgalp[aã]o\b|\bespa[cç]o\b/, 'MULTIPURPOSE', 'Espaço multiuso'],
];

const REGIONS: Record<string, Region> = {
  norte: 'norte', nordeste: 'nordeste', 'centro-oeste': 'centro-oeste', 'centro oeste': 'centro-oeste', sudeste: 'sudeste', sul: 'sul',
};

const AMENITY_WORDS: Record<string, AmenityKey> = {
  bar: 'bar', cadeira: 'cadeiras', poltrona: 'cadeiras', som: 'som', 'p.a': 'som', luz: 'luz', iluminacao: 'luz',
  estacionamento: 'estacionamento', acessivel: 'acessibilidade', acessibilidade: 'acessibilidade',
  'ar-condicionado': 'ar', 'ar condicionado': 'ar', climatizado: 'ar', doca: 'carga', 'carga e descarga': 'carga', gerador: 'gerador',
};

const num = (s: string) => parseInt(s.replace(/\./g, ''), 10);

export function parseQuery(input: string): ParsedQuery {
  const text = ` ${normalize(input)} `;
  const out: ParsedQuery = { chips: [] };

  for (const [re, type, label] of TYPE_WORDS) {
    if (re.test(text)) { out.type = type; out.chips.push(label); break; }
  }

  // Capacidade
  const between = text.match(/entre\s+([\d.]+)\s+e\s+([\d.]+)/);
  const min = text.match(/(?:mais de|acima de|pelo menos|no minimo|minimo de|a partir de|\+)\s*([\d.]+)/) ?? text.match(/([\d.]+)\s*\+/);
  const max = text.match(/(?:ate|no maximo|maximo de|menos de)\s*([\d.]+)/);
  if (between) { out.capMin = num(between[1]!); out.capMax = num(between[2]!); }
  else {
    if (min) out.capMin = num(min[1]!);
    if (max) out.capMax = num(max[1]!);
    if (!min && !max) {
      const bare = text.match(/([\d.]{3,})\s*(?:pessoas|lugares|publico|capacidade)/);
      if (bare) out.capMin = num(bare[1]!);
    }
  }
  if (out.capMin && out.capMax) out.chips.push(`${out.capMin.toLocaleString('pt-BR')} a ${out.capMax.toLocaleString('pt-BR')} pessoas`);
  else if (out.capMin) out.chips.push(`Acima de ${out.capMin.toLocaleString('pt-BR')} pessoas`);
  else if (out.capMax) out.chips.push(`Até ${out.capMax.toLocaleString('pt-BR')} pessoas`);

  // Formato e modelo de negócio
  if (/\bsentad/.test(text)) { out.format = 'SEATED'; out.chips.push('Sentado'); }
  else if (/\bde pe\b|\bem pe\b|\bpista\b/.test(text)) { out.format = 'STANDING'; out.chips.push('De pé'); }
  else if (/\bhibrid/.test(text)) { out.format = 'HYBRID'; out.chips.push('Híbrido'); }
  if (/\bbilheteria\b|\bdivisao\b|\bpercentual\b/.test(text)) { out.model = 'boxoffice'; out.chips.push('Bilheteria'); }
  else if (/\blocacao\b|\baluguel\b|\balugar\b|\bdiaria\b/.test(text)) { out.model = 'rental'; out.chips.push('Locação'); }

  // Regiões → estados (removemos nomes de estados antes, p/ "Rio Grande do Sul" não virar "Sul")
  let regionText = text;
  for (const s of Object.values(STATES)) regionText = regionText.replace(` ${normalize(s.name)} `, ' ');
  const regions = new Set<Region>();
  for (const [word, region] of Object.entries(REGIONS)) {
    if (new RegExp(`\\b${word}\\b`).test(regionText)) regions.add(region);
  }
  const states = new Set<string>();
  if (regions.size) {
    out.regions = [...regions];
    for (const [uf, s] of Object.entries(STATES)) if (regions.has(s.region)) states.add(uf);
    out.chips.push(`Região: ${out.regions.map((r) => r[0]!.toUpperCase() + r.slice(1)).join(' + ')}`);
  }
  // Estados por nome ou sigla ("em SP", "no Paraná")
  for (const [uf, s] of Object.entries(STATES)) {
    const name = normalize(s.name);
    // Exige preposição antes do nome/sigla: evita que "para" vire o estado do Pará.
    if (new RegExp(`\\b(?:em|no|na|do|da|de)\\s+(?:${name}|${uf.toLowerCase()})\\b`).test(text)) {
      if (!states.has(uf)) out.chips.push(s.name);
      states.add(uf);
    }
  }
  if (states.size) out.states = [...states];

  // Cidade: "em <palavras>" que não seja estado/região — resolvida no banco pelo serviço
  const cityMatch = text.match(/\b(?:em|na cidade de)\s+([a-z ]{3,40}?)(?=\s+(?:com|para|e|que|de pe|sentad)\b|\s*$)/);
  if (cityMatch) {
    const candidate = cityMatch[1]!.trim();
    const isState = Object.values(STATES).some((s) => normalize(s.name) === candidate) || candidate.length === 2;
    if (!isState && !REGIONS[candidate]) { out.city = candidate; out.chips.push(`Cidade: ${candidate}`); }
  }

  // Comodidades e camarins
  const amen = new Set<AmenityKey>();
  for (const [word, key] of Object.entries(AMENITY_WORDS)) if (text.includes(word)) amen.add(key);
  if (amen.size) {
    out.amenities = [...amen];
    out.chips.push(...out.amenities.map((k) => AMENITIES.find((a) => a.key === k)!.label));
  }
  const camarins = text.match(/([\d]+)\s*\+?\s*camarins?/);
  if (camarins) { out.dressingMin = num(camarins[1]!); out.chips.push(`${out.dressingMin}+ camarins`); }

  return out;
}
