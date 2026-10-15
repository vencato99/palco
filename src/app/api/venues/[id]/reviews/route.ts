import { createReview, listReviews } from '@/server/services/review.service';
import { requireUser } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { reviewSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Ctx = { params: { id: string } };

export const GET = route<Ctx>(async (req, { params }) => {
  const cursor = new URL(req.url).searchParams.get('cursor') ?? undefined;
  return ok(await listReviews(params.id, cursor));
});

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser(['PRODUCER']);
  return ok(await createReview(params.id, await parseBody(req, reviewSchema), user), { status: 201 });
});
