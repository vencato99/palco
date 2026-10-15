import { register } from '@/server/services/auth.service';
import { setSessionCookie } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { registerSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export const POST = route(async (req) => {
  const session = await register(await parseBody(req, registerSchema));
  await setSessionCookie(session);
  return ok({ user: { name: session.name, email: session.email, role: session.role } }, { status: 201 });
});
