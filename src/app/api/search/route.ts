import { searchVenuesByCity } from '@/server/services/venue.service';
import { parseQuery } from '@/lib/search-parser';
import { venueFiltersSchema } from '@/lib/validators';
import { ok, route } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/search?q=teatro para mais de 1000 pessoas no sul → filtros entendidos + locais por cidade. */
export const GET = route(async (req) => {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  const parsed = parseQuery(q);
  const { chips, regions, ...filters } = parsed;
  const groups = await searchVenuesByCity(venueFiltersSchema.parse({ ...filters, sort: 'rating' }));
  return ok({ chips, regions, filters, groups });
});
