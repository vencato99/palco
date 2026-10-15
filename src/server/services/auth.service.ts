import 'server-only';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import type { SessionPayload } from '@/lib/session';
import type { z } from 'zod';
import type { loginSchema, registerSchema } from '@/lib/validators';

const toSession = (u: { id: string; name: string; email: string; role: SessionPayload['role'] }): SessionPayload => ({
  sub: u.id, name: u.name, email: u.email, role: u.role,
});

export async function register(input: z.infer<typeof registerSchema>) {
  const exists = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (exists) throw new HttpError(409, 'Já existe uma conta com este e-mail.', { email: 'E-mail já cadastrado. Entre ou recupere a senha.' });
  const user = await prisma.user.create({
    data: {
      name: input.name, email: input.email, role: input.role,
      company: input.company, phone: input.phone, cnpj: input.cnpj,
      passwordHash: await bcrypt.hash(input.password, 11),
    },
  });
  return toSession(user);
}

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Mesma mensagem para e-mail ou senha errados: não revela quais e-mails existem.
  const valid = user && (await bcrypt.compare(input.password, user.passwordHash));
  if (!user || !valid) throw new HttpError(401, 'E-mail ou senha incorretos.');
  return toSession(user);
}

/* ---------------- Recuperação de senha ---------------- */

const sha = (t: string) => createHash('sha256').update(t).digest('hex');

/** Sempre responde igual (exista ou não o e-mail) para não revelar contas. */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return;
  const token = randomBytes(32).toString('base64url');
  await prisma.passwordReset.create({ data: { userId: user.id, tokenHash: sha(token), expiresAt: new Date(Date.now() + 30 * 60_000) } });
  const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/entrar/nova-senha?token=${token}`;
  // TODO: integrar provedor de e-mail (Resend, SES, Postmark…). Em dev, o link aparece no terminal.
  console.info(`[palco] Link de redefinição para ${email}: ${link}`);
}

export async function resetPassword(token: string, password: string) {
  const row = await prisma.passwordReset.findUnique({ where: { tokenHash: sha(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) throw new HttpError(400, 'Link inválido ou expirado. Peça um novo.');
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await bcrypt.hash(password, 11) } }),
    prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
}
