import { decideSuggestion } from '@/server/services/suggestion.service';
import { requireUser } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { suggestionDecisionSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export const PATCH = route<{ params: { id: string } }>(async (req, { params }) => {
  const admin = await requireUser(['ADMIN']);
  return ok(await decideSuggestion(params.id, await parseBody(req, suggestionDecisionSchema), admin));
});
