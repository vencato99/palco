import { NextResponse } from 'next/server';
import type { z, ZodTypeAny } from 'zod';
import { zodFields } from './zod-fields';

export { zodFields };

export class HttpError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}


export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.output<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, 'Corpo da requisição inválido.');
  }
  const res = schema.safeParse(raw);
  if (!res.success) throw new HttpError(422, 'Revise os campos destacados.', zodFields(res.error));
  return res.data;
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Envolve um route handler: padroniza erros e nunca vaza stack trace. */
export function route<C = { params: Record<string, string> }>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) {
        return NextResponse.json({ error: e.message, fields: e.fields }, { status: e.status });
      }
      console.error(e);
      return NextResponse.json({ error: 'Erro inesperado. Tente novamente.' }, { status: 500 });
    }
  };
}

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
