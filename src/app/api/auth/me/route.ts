import { getSession } from '@/lib/auth';
import { ok, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const s = await getSession();
  return ok({ user: s ? { id: s.sub, name: s.name, email: s.email, role: s.role } : null });
});
