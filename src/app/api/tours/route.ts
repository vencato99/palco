import { listTours, saveTour } from '@/server/services/tour.service';
import { requireUser } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { tourSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => ok(await listTours(await requireUser())));

export const POST = route(async (req) => {
  const user = await requireUser();
  return ok(await saveTour(await parseBody(req, tourSchema), user), { status: 201 });
});
