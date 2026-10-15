import { z } from 'zod';
import { AMENITY_KEYS, UFS } from './constants';

const uf = z.string().length(2).toUpperCase().refine((v) => UFS.includes(v), 'Estado inválido');
const optionalText = z.string().trim().max(500).optional().nullable().transform((v) => v || null);

export const venueTypeEnum = z.enum(['THEATER', 'CONCERT_HALL', 'AUDITORIUM', 'MULTIPURPOSE', 'ARENA', 'CONVENTION_CENTER']);
export const seatingEnum = z.enum(['SEATED', 'STANDING', 'HYBRID']);

/* ---------- Auth ---------- */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Digite um e-mail válido.'),
  password: z.string().min(1, 'Digite sua senha.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.'),
  email: z.string().trim().toLowerCase().email('Digite um e-mail válido.'),
  password: z
    .string()
    .min(8, 'A senha precisa de pelo menos 8 caracteres.')
    .regex(/[A-Z]/, 'Inclua uma letra maiúscula.')
    .regex(/\d/, 'Inclua um número.'),
  role: z.enum(['PRODUCER', 'VENUE_OWNER', 'ARTIST']).default('PRODUCER'),
  company: optionalText,
  phone: optionalText,
  cnpj: optionalText,
});

/* ---------- Venue (etapas do formulário) ---------- */
export const venueBasicsSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do local.').max(120),
  type: venueTypeEnum,
  state: uf,
  city: z.string().trim().min(2, 'Informe a cidade.').max(80),
  address: optionalText,
  description: z.string().trim().max(5000).optional().nullable(),
});

export const venueAudienceSchema = z
  .object({
    capacity: z.coerce.number().int().positive('Informe a capacidade em número de pessoas.').max(200000),
    seatingFormat: seatingEnum,
    acceptsRental: z.boolean(),
    acceptsBoxOffice: z.boolean(),
    rentalPriceCents: z.coerce.number().int().nonnegative().optional().nullable(),
    boxOfficePercent: z.coerce.number().min(0).max(100).optional().nullable(),
  })
  .refine((v) => v.acceptsRental || v.acceptsBoxOffice, {
    message: 'Escolha pelo menos um modelo de negócio.',
    path: ['acceptsRental'],
  });

export const venueStructureSchema = z.object({
  dressingRooms: z.coerce.number().int().min(0).max(100),
  parkingSpots: z.coerce.number().int().min(0).max(100000),
  stageWidth: z.coerce.number().positive().optional().nullable(),
  stageDepth: z.coerce.number().positive().optional().nullable(),
  stageHeight: z.coerce.number().positive().optional().nullable(),
  amenities: z.array(z.enum(AMENITY_KEYS)).default([]),
  techSpecs: z.record(z.string().max(300)).optional().nullable(),
});

export const venuePhotosSchema = z.object({
  photos: z
    .array(z.object({ url: z.string().min(1), caption: z.string().max(120).optional().nullable() }))
    .max(40)
    .default([]),
  coverIndex: z.number().int().min(0).default(0),
});

export const venueContactsSchema = z.object({
  contactName: optionalText,
  contactEmail: z.string().trim().email('E-mail inválido.').optional().nullable().or(z.literal('').transform(() => null)),
  contactPhone: optionalText,
  whatsapp: optionalText,
  website: optionalText,
  instagram: optionalText,
});

export const venueInputSchema = venueBasicsSchema
  .merge(venueStructureSchema)
  .merge(venuePhotosSchema)
  .merge(venueContactsSchema)
  .and(venueAudienceSchema)
  .and(z.object({ intent: z.enum(['draft', 'publish']).default('draft') }));

export type VenueInput = z.infer<typeof venueInputSchema>;

/* ---------- Busca / filtros ---------- */
export const venueFiltersSchema = z.object({
  q: z.string().trim().max(200).optional(),
  type: venueTypeEnum.optional(),
  capMin: z.coerce.number().int().positive().optional(),
  capMax: z.coerce.number().int().positive().optional(),
  format: seatingEnum.optional(),
  model: z.enum(['rental', 'boxoffice']).optional(),
  states: z.array(uf).optional(),
  city: z.string().trim().max(80).optional(),
  amenities: z.array(z.enum(AMENITY_KEYS)).optional(),
  dressingMin: z.coerce.number().int().min(0).optional(),
  parkingMin: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['rating', 'capacity', 'recent']).default('rating'),
  cursor: z.string().optional(),
});
export type VenueFilters = z.infer<typeof venueFiltersSchema>;

/* ---------- Reviews, sugestões, turnês, pedidos ---------- */
const score = z.coerce.number().int().min(1).max(5);
export const reviewSchema = z.object({
  eventName: z.string().trim().min(2).max(120),
  eventDate: z.coerce.date(),
  overall: score, technical: score, service: score, payment: score, audience: score, logistics: score,
  comment: z.string().trim().min(10, 'Conte um pouco mais (mínimo de 10 caracteres).').max(2000),
});

export const suggestionSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do local.'),
  type: venueTypeEnum,
  state: uf,
  city: z.string().trim().min(2, 'Informe a cidade.'),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  seatingFormat: seatingEnum.optional().nullable(),
  acceptsRental: z.boolean().optional().nullable(),
  acceptsBoxOffice: z.boolean().optional().nullable(),
  amenityKeys: z.array(z.enum(AMENITY_KEYS)).default([]),
  dressingRooms: z.coerce.number().int().min(0).optional().nullable(),
  photoUrls: z.array(z.string()).max(10).default([]),
  contact: optionalText,
  relation: z.enum(['MANAGER', 'PRODUCED_THERE', 'KNOWS_IT']),
});

export const suggestionDecisionSchema = z.object({
  action: z.enum(['approve', 'needs_info', 'reject', 'in_review']),
  internalNotes: z.string().max(2000).optional(),
  /** Correções feitas pelo admin antes de aprovar. */
  overrides: venueBasicsSchema.partial().merge(venueStructureSchema.partial()).extend({
    capacity: z.coerce.number().int().positive().optional(),
    seatingFormat: seatingEnum.optional(),
    acceptsRental: z.boolean().optional(),
    acceptsBoxOffice: z.boolean().optional(),
  }).optional(),
});

export const tourSchema = z.object({
  name: z.string().trim().min(2).max(120),
  stops: z.array(z.object({ venueId: z.string(), date: z.coerce.date().optional().nullable() })).max(100),
});

export const availabilitySchema = z.object({
  date: z.coerce.date(),
  expectedAudience: z.coerce.number().int().positive().optional().nullable(),
  eventType: z.string().trim().min(2).max(60),
  message: z.string().trim().max(2000).optional().nullable(),
});
