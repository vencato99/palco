import { createVenue, searchVenues } from '@/server/services/venue.service';
import { requireUser } from '@/lib/auth';
import { filtersFromParams } from '@/lib/filters';
import { ok, parseBody, route } from '@/lib/http';
import { venueInputSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/venues?tipo=THEATER&min=1000&uf=PR,SP&cursor=… — usado pelo "Carregar mais". */
export const GET = route(async (req) => {
  const filters = filtersFromParams(new URL(req.url).searchParams);
  const data = await searchVenues(filters);
  return ok(data, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
});

export const POST = route(async (req) => {
  const user = await requireUser(['VENUE_OWNER', 'PRODUCER']);
  const venue = await createVenue(await parseBody(req, venueInputSchema), user);
  return ok(venue, { status: 201 });
});
