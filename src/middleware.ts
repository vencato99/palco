import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/constants';
import { verifySession } from '@/lib/session';

/** Protege áreas logadas antes de renderizar qualquer coisa (roda na edge). */
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = req.nextUrl;

  if (!session) {
    const url = new URL('/entrar', req.url);
    url.searchParams.set('voltar', pathname + search);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/minha-conta/:path*', '/admin/:path*'] };
