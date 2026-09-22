import { NextResponse } from 'next/server';
import { getTenantContext } from '@/core/tenancy/context';
import { AuthorizationError } from '@/core/tenancy/permissions';
import { listCategories } from '@/lib/cardapio/service';

/**
 * GET /api/catalog/categories
 *
 * Lista as categorias do catálogo da organização autenticada.
 * O tenant é resolvido no servidor a partir da sessão.
 */
export async function GET() {
  const ctx = await getTenantContext();

  if (!ctx) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  try {
    return NextResponse.json({ data: listCategories(ctx) });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    throw error;
  }
}
