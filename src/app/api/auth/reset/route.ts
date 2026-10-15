import { z } from 'zod';
import { resetPassword } from '@/server/services/auth.service';
import { ok, parseBody, route } from '@/lib/http';
import { registerSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export const POST = route(async (req) => {
  const { token, password } = await parseBody(req, z.object({ token: z.string().min(20), password: registerSchema.shape.password }));
  await resetPassword(token, password);
  return ok({ ok: true });
});
