import { z } from 'zod';
import { requestPasswordReset } from '@/server/services/auth.service';
import { ok, parseBody, route } from '@/lib/http';

export const runtime = 'nodejs';

export const POST = route(async (req) => {
  const { email } = await parseBody(req, z.object({ email: z.string().trim().toLowerCase().email('Digite um e-mail válido.') }));
  await requestPasswordReset(email);
  return ok({ ok: true });
});
