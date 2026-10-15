import { createSuggestion } from '@/server/services/suggestion.service';
import { getSession } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { suggestionSchema } from '@/lib/validators';

export const runtime = 'nodejs';

/** Qualquer pessoa pode sugerir; se estiver logada, a sugestão fica vinculada à conta. */
export const POST = route(async (req) => {
  const s = await createSuggestion(await parseBody(req, suggestionSchema), await getSession());
  return ok(s, { status: 201 });
});
