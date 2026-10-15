'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { FormError, useApi } from './useApi';

const safeBack = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/minha-conta/locais');

export function LoginForm() {
  const router = useRouter();
  const back = safeBack(useSearchParams().get('voltar'));
  const { call, loading, error, fields } = useApi();
  const [show, setShow] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await call('/api/auth/login', 'POST', { email: f.get('email'), password: f.get('password') });
    if (r.ok) { router.replace(back); router.refresh(); }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <FormError message={error} />
      <Input label="E-mail" name="email" type="email" autoComplete="email" required error={fields.email} />
      <div className="relative">
        <Input label="Senha" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required error={fields.password} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-[34px] h-10 px-3 text-sm font-semibold">{show ? 'Ocultar' : 'Mostrar'}</button>
      </div>
      <Link href="/entrar/recuperar" className="self-end text-sm font-semibold underline">Esqueci a senha</Link>
      <Button type="submit" size="lg" loading={loading}>Entrar</Button>
      <p className="text-center text-sm text-mute">Ainda não tem conta? <Link href={`/cadastro?voltar=${encodeURIComponent(back)}`} className="font-semibold text-paper underline">Criar conta</Link></p>
    </form>
  );
}

const ROLES = [
  { value: 'PRODUCER', label: 'Produtor', text: 'Busco locais e monto turnês' },
  { value: 'VENUE_OWNER', label: 'Local / casa', text: 'Quero divulgar meu espaço' },
  { value: 'ARTIST', label: 'Artista', text: 'Acompanho minhas datas' },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const back = useSearchParams().get('voltar');
  const { call, loading, error, fields } = useApi();
  const [role, setRole] = useState<(typeof ROLES)[number]['value']>('PRODUCER');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await call('/api/auth/register', 'POST', { ...f, role });
    if (r.ok) { router.replace(back && back.startsWith('/') ? back : role === 'VENUE_OWNER' ? '/minha-conta/locais/novo' : '/locais'); router.refresh(); }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <FormError message={error} />
      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Eu sou</legend>
        {ROLES.map((r) => (
          <button key={r.value} type="button" aria-pressed={role === r.value} onClick={() => setRole(r.value)}
            className={cn('flex flex-col gap-1 rounded-2xl p-4 text-left', role === r.value ? 'border-2 border-paper bg-ink-3' : 'border border-line')}>
            <span className="font-bold">{r.label}</span><span className="text-sm text-mute">{r.text}</span>
          </button>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome completo" name="name" autoComplete="name" error={fields.name} />
        <Input label="Produtora / empresa" name="company" autoComplete="organization" />
        <Input label="E-mail" name="email" type="email" autoComplete="email" error={fields.email} />
        <Input label="WhatsApp" name="phone" type="tel" autoComplete="tel" />
        <Input label="CNPJ (opcional)" name="cnpj" />
        <Input label="Senha" name="password" type="password" autoComplete="new-password" error={fields.password} hint="8+ caracteres, uma maiúscula e um número." />
      </div>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" required className="h-5 w-5 accent-stage" /> Aceito os termos de uso e a política de privacidade</label>
      <Button type="submit" size="lg" loading={loading}>Criar conta</Button>
      <p className="text-center text-sm text-mute">Já tem conta? <Link href="/entrar" className="font-semibold text-paper underline">Entrar</Link></p>
    </form>
  );
}

export function ForgotForm() {
  const { call, loading, error, fields } = useApi();
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email'));
    const r = await call('/api/auth/forgot', 'POST', { email });
    if (r.ok) setSentTo(email);
  }

  if (sentTo) return (
    <div className="flex flex-col gap-3 text-center">
      <h2 className="font-display text-2xl font-bold">Verifique seu e-mail</h2>
      <p className="text-mute">Se existir uma conta para <strong className="text-paper">{sentTo}</strong>, enviamos um link que vale por 30 minutos.</p>
      <Link href="/entrar" className="mt-2 font-semibold underline">Voltar ao login</Link>
    </div>
  );
  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <FormError message={error} />
      <Input label="E-mail da conta" name="email" type="email" autoComplete="email" error={fields.email} />
      <Button type="submit" size="lg" loading={loading}>Enviar link</Button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const { call, loading, error, fields } = useApi();
  const [pwd, setPwd] = useState('');
  const [conf, setConf] = useState('');
  const rules = [['Pelo menos 8 caracteres', pwd.length >= 8], ['Uma letra maiúscula', /[A-Z]/.test(pwd)], ['Um número', /\d/.test(pwd)]] as const;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pwd !== conf) return;
    const r = await call('/api/auth/reset', 'POST', { token, password: pwd });
    if (r.ok) router.replace('/entrar?senha=ok');
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <FormError message={error} />
      <Input label="Nova senha" type="password" autoComplete="new-password" value={pwd} onChange={(e) => setPwd(e.target.value)} error={fields.password} />
      <ul className="flex flex-col gap-1 text-sm">{rules.map(([l, ok]) => <li key={l} className={ok ? 'font-semibold text-ok' : 'text-mute'}>{ok ? '✓' : '○'} {l}</li>)}</ul>
      <Input label="Confirmar senha" type="password" autoComplete="new-password" value={conf} onChange={(e) => setConf(e.target.value)} error={conf && conf !== pwd ? 'As senhas não coincidem.' : undefined} />
      <Button type="submit" size="lg" loading={loading} disabled={!rules.every(([, ok]) => ok) || pwd !== conf}>Salvar nova senha</Button>
    </form>
  );
}
