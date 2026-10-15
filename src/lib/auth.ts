import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Role } from '@prisma/client';
import { SESSION_COOKIE } from './constants';
import { HttpError } from './http';
import { SESSION_TTL_SECONDS, signSession, verifySession, type SessionPayload } from './session';

/** Lê a sessão uma única vez por requisição (memoizado com React cache). */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
});

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

/** Garante usuário logado (e, opcionalmente, um dos papéis). Lança 401/403. */
export async function requireUser(roles?: Role[]) {
  const session = await getSession();
  if (!session) throw new HttpError(401, 'Entre na sua conta para continuar.');
  if (roles && !roles.includes(session.role) && session.role !== 'ADMIN') {
    throw new HttpError(403, 'Você não tem permissão para esta ação.');
  }
  return session;
}
