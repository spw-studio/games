import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/core/tenancy/context';
import { AuthorizationError } from '@/core/tenancy/permissions';
import { listProducts } from '@/lib/cardapio/service';

/**
 * GET /api/catalog/products
 *
 * Lista os produtos do catálogo da organização autenticada.
 * O tenant é resolvido no servidor a partir da sessão — `organizationId`
 * nunca é aceito do cliente.
 */
export async function GET(request: NextRequest) {
  const ctx = await getTenantContext();

  if (!ctx) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  try {
    const categoryId =
      request.nextUrl.searchParams.get('categoryId') ?? undefined;

    return NextResponse.json({
      data: listProducts(ctx, { categoryId }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    throw error;
  }
}
