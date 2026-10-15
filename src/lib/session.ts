/**
 * Token de sessão (JWT HS256). Este arquivo não importa nada de Node,
 * então pode rodar tanto no middleware (edge) quanto nas rotas (node).
 */
import { jwtVerify, SignJWT } from 'jose';
import type { Role } from '@prisma/client';

export type SessionPayload = { sub: string; name: string; email: string; role: Role };

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error('AUTH_SECRET ausente ou curta demais.');
  return new TextEncoder().encode(s);
};

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
