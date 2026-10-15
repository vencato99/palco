import { clearSessionCookie } from '@/lib/auth';
import { ok, route } from '@/lib/http';

export const POST = route(async () => {
  clearSessionCookie();
  return ok({ ok: true });
});
