import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/core/tenancy/context';
import { isDatabaseEnabled } from '@/lib/db/pool';
import { getOrganizationById } from '@/lib/db/identity';
import { unauthorized } from '@/lib/api/identity-http';

/**
 * GET /api/session/org
 *
 * Devolve o contexto de tenant resolvido NO SERVIDOR para a UI
 * (organização, papel, SUPER_ADMIN) — a fonte de verdade para o
 * client exibir ou ocultar ações administrativas.
 */
export async function GET() {
  const ctx = await getTenantContext();

  if (!ctx) {
    return unauthorized();
  }

  let organization: { id: string; name: string; slug: string } | null = null;

  if (ctx.organizationId && isDatabaseEnabled()) {
    try {
      organization = await getOrganizationById(ctx.organizationId);
    } catch (error) {
      console.error('[api/session/org] falha ao carregar organização:', error);
    }
  }

  return NextResponse.json({
    data: {
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      role: ctx.role,
      isSuperAdmin: ctx.isSuperAdmin,
      organization,
      databaseEnabled: isDatabaseEnabled(),
    },
  });
}
