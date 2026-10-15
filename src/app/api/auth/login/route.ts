import { login } from '@/server/services/auth.service';
import { setSessionCookie } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { loginSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export const POST = route(async (req) => {
  const session = await login(await parseBody(req, loginSchema));
  await setSessionCookie(session);
  return ok({ user: { name: session.name, email: session.email, role: session.role } });
});
